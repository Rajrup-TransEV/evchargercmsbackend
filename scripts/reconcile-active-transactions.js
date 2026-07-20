import { PrismaClient } from "@prisma/client";
import { normalizeTransactionId } from "../lib/charging/transaction-core.js";

const prisma = new PrismaClient();

function activeConnectorTransactions(payload) {
  const active = [];
  for (const [chargerid, charger] of Object.entries(payload || {})) {
    for (const connector of Object.values(charger?.connectors || {})) {
      const rawId =
        connector?.transaction_id ?? connector?.latest_transaction_id ?? null;
      if (rawId === null || rawId === undefined || rawId === "") continue;
      active.push({
        chargerid,
        transactionid: normalizeTransactionId(rawId),
      });
    }
  }
  return active;
}

let failed = false;
try {
  if (!process.env.EXTERNAL_URI || !process.env.OCPP_API_KEY) {
    throw new Error("EXTERNAL_URI and OCPP_API_KEY are required");
  }
  const response = await fetch(`${process.env.EXTERNAL_URI}/api/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.OCPP_API_KEY,
    },
    body: JSON.stringify({ uid: "all_online" }),
    signal: AbortSignal.timeout(20_000),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`OCPP HAL status failed (${response.status}): ${text.slice(0, 500)}`);
  }
  const payload = text ? JSON.parse(text) : {};
  const active = activeConnectorTransactions(payload);

  for (const item of active) {
    const transaction = await prisma.chargerTransaction.findUnique({
      where: { transactionid: item.transactionid },
    });
    if (!transaction) {
      failed = true;
      console.error(
        `MISSING: HAL has active ${item.chargerid}/${item.transactionid}, but CMS has no transaction row`
      );
      continue;
    }
    if (transaction.chargerid !== item.chargerid) {
      failed = true;
      console.error(
        `MISMATCH: transaction ${item.transactionid} belongs to ${transaction.chargerid} in CMS, not ${item.chargerid}`
      );
      continue;
    }
    if (transaction.status === "COMPLETED") {
      failed = true;
      console.error(
        `CONFLICT: HAL reports completed CMS transaction ${item.transactionid} as active`
      );
      continue;
    }
    await prisma.chargerTransaction.update({
      where: { transactionid: item.transactionid },
      data: { status: "ACTIVE" },
    });
    console.log(`ACTIVE: ${item.chargerid}/${item.transactionid}`);
  }

  const unresolvedRecent = await prisma.chargerTransaction.count({
    where: {
      status: "UNKNOWN",
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60_000) },
    },
  });
  console.log(
    `HAL active transactions reconciled: ${active.length}; recent UNKNOWN rows remaining: ${unresolvedRecent}`
  );
  if (unresolvedRecent > 0) {
    console.warn(
      "Recent UNKNOWN rows were not reported online by the HAL. Review them manually; they were not guessed active or completed."
    );
  }
} catch (error) {
  failed = true;
  console.error(`Active-transaction reconciliation failed: ${error.message}`);
} finally {
  await prisma.$disconnect();
}

if (failed) process.exitCode = 1;
