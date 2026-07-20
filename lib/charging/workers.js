import { PrismaClient } from "@prisma/client";
import generatebill from "../../admin/crud/transactions/billgenerate.js";
import { requestRemoteStop } from "./remote-stop.js";
import { TRANSACTION_STATUS, retryDelayMs } from "./transaction-core.js";

const prisma = new PrismaClient();
let billingRunning = false;
let stopRunning = false;

async function runBillingJobs() {
  if (billingRunning) return;
  billingRunning = true;
  try {
    const staleBefore = new Date(Date.now() - 10 * 60_000);
    for (let processed = 0; processed < 10; processed += 1) {
      const now = new Date();
      const job = await prisma.billingJob.findFirst({
        where: {
          OR: [
            {
              status: { in: ["PENDING", "RETRYING"] },
              nextattemptat: { lte: now },
            },
            { status: "PROCESSING", updatedAt: { lt: staleBefore } },
          ],
        },
        orderBy: { nextattemptat: "asc" },
      });
      if (!job) break;

      const claimed = await prisma.billingJob.updateMany({
        where: {
          id: job.id,
          status: job.status,
          updatedAt: job.updatedAt,
        },
        data: { status: "PROCESSING", attempts: { increment: 1 } },
      });
      if (claimed.count === 0) continue;

      const result = await generatebill(job.userid, job.transactionid);
      const attempt = job.attempts + 1;
      if (result === 1) {
        await prisma.billingJob.update({
          where: { id: job.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            lastError: null,
          },
        });
      } else if (attempt >= job.maxattempts) {
        await prisma.billingJob.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            lastError: `Bill generator returned ${result}`,
          },
        });
      } else {
        await prisma.billingJob.update({
          where: { id: job.id },
          data: {
            status: "RETRYING",
            nextattemptat: new Date(Date.now() + retryDelayMs(attempt)),
            lastError: `Bill generator returned ${result}`,
          },
        });
      }
    }
  } catch (error) {
    console.error("Billing worker failed:", error);
  } finally {
    billingRunning = false;
  }
}

async function runStopReconciliation() {
  if (stopRunning) return;
  stopRunning = true;
  try {
    const now = new Date();
    const staleProcessing = new Date(Date.now() - 2 * 60_000);
    const transactions = await prisma.chargerTransaction.findMany({
      where: {
        OR: [
          {
            status: {
              in: [
                TRANSACTION_STATUS.STOP_REQUESTED,
                TRANSACTION_STATUS.STOP_RETRYING,
              ],
            },
            nextstopattemptat: { lte: now },
          },
          {
            status: TRANSACTION_STATUS.STOP_PROCESSING,
            laststopattemptat: { lt: staleProcessing },
          },
        ],
      },
      orderBy: { nextstopattemptat: "asc" },
      take: 20,
    });

    const maxAttempts = Math.max(
      Number(process.env.STOP_RETRY_MAX_ATTEMPTS) || 10,
      1
    );
    for (const transaction of transactions) {
      if (transaction.stopattempts >= maxAttempts) {
        await prisma.chargerTransaction.updateMany({
          where: {
            id: transaction.id,
            status: { not: TRANSACTION_STATUS.COMPLETED },
          },
          data: {
            status: TRANSACTION_STATUS.STOP_FAILED,
            nextstopattemptat: null,
            laststoperror:
              transaction.laststoperror || "Maximum remote-stop attempts reached",
          },
        });
        continue;
      }

      if (transaction.status === TRANSACTION_STATUS.STOP_PROCESSING) {
        const released = await prisma.chargerTransaction.updateMany({
          where: {
            id: transaction.id,
            status: TRANSACTION_STATUS.STOP_PROCESSING,
            laststopattemptat: transaction.laststopattemptat,
          },
          data: { status: TRANSACTION_STATUS.STOP_RETRYING },
        });
        if (released.count === 0) continue;
        transaction.status = TRANSACTION_STATUS.STOP_RETRYING;
      }
      await requestRemoteStop(prisma, transaction);
    }
  } catch (error) {
    console.error("Stop reconciliation worker failed:", error);
  } finally {
    stopRunning = false;
  }
}

async function expireStartIntents() {
  try {
    const result = await prisma.chargingStartIntent.deleteMany({
      where: { expiresat: { lte: new Date() } },
    });
    if (result.count > 0) {
      console.warn(`Expired ${result.count} stale charging start intent(s)`);
    }
  } catch (error) {
    console.error("Start-intent cleanup failed:", error);
  }
}

export function startChargingWorkers() {
  if (
    String(process.env.CHARGING_WORKERS_ENABLED ?? "true").toLowerCase() !==
    "true"
  ) {
    console.log("Charging lifecycle workers are disabled");
    return;
  }

  const intervalMs = Math.max(
    Number(process.env.CHARGING_WORKER_INTERVAL_MS) || 30_000,
    5_000
  );
  void runBillingJobs();
  void runStopReconciliation();
  void expireStartIntents();
  setInterval(runBillingJobs, intervalMs).unref();
  setInterval(runStopReconciliation, intervalMs).unref();
  setInterval(expireStartIntents, intervalMs).unref();
  console.log(`Charging lifecycle workers started (${intervalMs}ms interval)`);
}

export { expireStartIntents, runBillingJobs, runStopReconciliation };
