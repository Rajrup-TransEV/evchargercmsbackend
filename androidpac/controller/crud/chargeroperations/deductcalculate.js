import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
import crypto from "crypto";
import { loadChargingPolicy } from "../../../../lib/charging/policy.js";
import { calculateChargingCost } from "../../../../lib/charging/pricing.js";
import {
  TRANSACTION_STATUS,
  isPrismaUniqueError,
  normalizeTransactionId,
  parseFiniteDecimal,
} from "../../../../lib/charging/transaction-core.js";
dotenv.config();

const prisma = new PrismaClient();

class CallbackError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function consumedKwhFromPayload({ consumedkwh, meterstart, meterstop }) {
  if (consumedkwh !== undefined && consumedkwh !== null && consumedkwh !== "") {
    return parseFiniteDecimal(consumedkwh, "consumedkwh", { minimum: 0 });
  }
  const start = parseFiniteDecimal(meterstart, "meterstart", { minimum: 0 });
  const stop = parseFiniteDecimal(meterstop, "meterstop", { minimum: 0 });
  if (stop < start) {
    throw new TypeError("meterstop cannot be lower than meterstart");
  }
  return (stop - start) / 1000;
}

async function alreadyProcessedResponse(
  res,
  transactionid,
  expectedUserid,
  expectedChargerid
) {
  const [session, bill] = await Promise.all([
    prisma.charingsessions.findUnique({ where: { sessionid: transactionid } }),
    prisma.userBilling.findUnique({ where: { sessionid: transactionid } }),
  ]);
  if (!session) return null;
  if (
    session.userid !== expectedUserid ||
    session.chargerid !== expectedChargerid
  ) {
    throw new CallbackError(
      409,
      "Completion payload does not match the existing charging session"
    );
  }
  if (!bill) {
    await prisma.billingJob.upsert({
      where: { transactionid },
      create: { transactionid, userid: expectedUserid },
      update: {
        userid: expectedUserid,
        status: "PENDING",
        nextattemptat: new Date(),
        lastError: null,
      },
    });
  }
  return res.status(200).json({
    message: "Charging session already processed",
    already_processed: true,
    bill_result: 1,
    billing_status: bill ? "completed" : "queued",
    transactionid,
  });
}

const deductcalculate = async (req, res) => {
  const apiauthkey = req.headers["apiauthkey"];
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const {
    sessionid,
    chargerid,
    starttime,
    userid,
    stoptime,
    meterstart,
    meterstop,
    consumedkwh,
  } = req.body;

  try {
    if (sessionid === undefined || sessionid === null || sessionid === "") {
      return res.status(400).json({ message: "Missing sessionid in request body" });
    }
    if (!chargerid) {
      return res.status(400).json({ message: "Missing chargerid in request body" });
    }
    if (!userid) {
      return res.status(400).json({ message: "Missing userid in request body" });
    }

    const transactionid = normalizeTransactionId(sessionid);
    const normalizedUserid = String(userid);
    const normalizedChargerid = String(chargerid);
    const duplicateResponse = await alreadyProcessedResponse(
      res,
      transactionid,
      normalizedUserid,
      normalizedChargerid
    );
    if (duplicateResponse) return duplicateResponse;

    const chargingTransaction = await prisma.chargerTransaction.findUnique({
      where: { transactionid },
    });
    if (!chargingTransaction) {
      return res.status(409).json({
        message: "Charging start has not been recorded for this transaction",
        transactionid,
        retryable: true,
      });
    }
    if (
      chargingTransaction.userid !== normalizedUserid ||
      chargingTransaction.chargerid !== normalizedChargerid
    ) {
      return res.status(409).json({
        message: "Completion payload does not match the recorded charging transaction",
        transactionid,
      });
    }

    await prisma.charger_Unit.findFirstOrThrow({
      where: { uid: normalizedChargerid },
    });
    const policy = await loadChargingPolicy(prisma, {
      userid: normalizedUserid,
      chargerid: normalizedChargerid,
    });
    const kwhConsumed = consumedKwhFromPayload({
      consumedkwh,
      meterstart,
      meterstop,
    });
    const cost = calculateChargingCost({
      consumedKwh: kwhConsumed,
      tariffPerKwh: policy.tariffPerKwh,
      gstPercent: policy.gstPercent,
    });
    const associatedAdmin = process.env.ASSOCIATED_ADMIN;

    const txResult = await prisma.$transaction(
      async (tx) => {
        // MySQL row locking is essential because charging completion, Razorpay,
        // admin recharge, and wallet edits can otherwise overwrite one another.
        const lockedWallets = await tx.$queryRaw`
          SELECT id, uid, balance
          FROM wallet
          WHERE uid = ${policy.wallet.uid}
          FOR UPDATE
        `;
        if (lockedWallets.length !== 1) {
          throw new CallbackError(409, "Wallet could not be locked uniquely");
        }

        const duplicate = await tx.charingsessions.findUnique({
          where: { sessionid: transactionid },
        });
        if (duplicate) return { alreadyProcessed: true };

        const exactTransaction = await tx.chargerTransaction.findUnique({
          where: { transactionid },
        });
        if (
          !exactTransaction ||
          exactTransaction.userid !== normalizedUserid ||
          exactTransaction.chargerid !== normalizedChargerid
        ) {
          throw new CallbackError(409, "Recorded transaction changed during completion");
        }
        if (exactTransaction.status === TRANSACTION_STATUS.COMPLETED) {
          throw new CallbackError(
            409,
            "Transaction is marked completed without a charging session; reconciliation is required"
          );
        }

        const currentBalance = parseFiniteDecimal(
          lockedWallets[0].balance ?? 0,
          "wallet balance"
        );
        const currentBalancePaise = Math.round(currentBalance * 100);
        if (!Number.isSafeInteger(currentBalancePaise)) {
          throw new CallbackError(409, "Wallet balance exceeds the supported range");
        }
        const updatedBalancePaise = currentBalancePaise - cost.totalPaise;
        const updatedBalance = updatedBalancePaise / 100;
        const hardLimit = Number(policy.hardLimit || 0);
        if (updatedBalance < hardLimit) {
          logging(
            "warn",
            `OCPP finalization below hard limit for user ${normalizedUserid}: projected ₹${updatedBalance.toFixed(2)}, hard limit ₹${hardLimit.toFixed(2)}`,
            "deductcalculate.js"
          );
        }

        await tx.wallet.update({
          where: { uid: policy.wallet.uid },
          data: { balance: updatedBalance.toFixed(2) },
        });
        await tx.charingsessions.create({
          data: {
            uid: crypto.randomUUID(),
            sessionid: transactionid,
            chargerid: normalizedChargerid,
            userid: normalizedUserid,
            startime: starttime == null ? null : String(starttime),
            stoptime: stoptime == null ? null : String(stoptime),
            meterstart: meterstart == null ? null : String(meterstart),
            meterstop: meterstop == null ? null : String(meterstop),
            consumedkwh: String(cost.consumedKwh),
            totalcost: cost.totalText,
            associatedadminid: associatedAdmin,
          },
        });
        await tx.transactionHistory.create({
          data: {
            uid: crypto.randomUUID(),
            paymentid: `charge_${transactionid}`,
            walletid: policy.wallet.uid,
            userid: normalizedUserid,
            price: cost.totalText,
            gst: cost.gstText,
            gstdeductedamount: cost.gstText,
            taxableamount: cost.taxableText,
            associatedadminid: associatedAdmin,
          },
        });
        await tx.chargerTransaction.update({
          where: { transactionid },
          data: {
            status: TRANSACTION_STATUS.COMPLETED,
            completedat: new Date(),
            nextstopattemptat: null,
            laststoperror: null,
          },
        });
        await tx.billingJob.upsert({
          where: { transactionid },
          create: { transactionid, userid: normalizedUserid },
          update: {
            userid: normalizedUserid,
            status: "PENDING",
            nextattemptat: new Date(),
            lastError: null,
          },
        });

        return { alreadyProcessed: false, updatedBalance };
      },
      {
        isolationLevel: "ReadCommitted",
        maxWait: 10_000,
        timeout: 20_000,
      }
    );

    if (txResult.alreadyProcessed) {
      return alreadyProcessedResponse(
        res,
        transactionid,
        normalizedUserid,
        normalizedChargerid
      );
    }

    return res.status(200).json({
      message: "Charging session completed successfully",
      consumed: cost.consumedKwh,
      total_cost: cost.totalText,
      taxable_amount: cost.taxableText,
      gst_charged: cost.gstText,
      remainingBalance: Number(txResult.updatedBalance.toFixed(2)),
      // Preserve the historic numeric success contract while moving slow PDF work
      // off the OCPP callback path.
      bill_result: 1,
      billing_status: "queued",
      transactionid,
    });
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      const transactionid = normalizeTransactionId(sessionid);
      const duplicateResponse = await alreadyProcessedResponse(
        res,
        transactionid,
        String(userid),
        String(chargerid)
      );
      if (duplicateResponse) return duplicateResponse;
    }
    console.log("Error in deductcalculate: ", error);
    const status =
      error instanceof CallbackError
        ? error.status
        : error instanceof TypeError || error instanceof RangeError
          ? 400
          : 500;
    return res.status(status).json({ error: error.message });
  }
};

export default deductcalculate;
