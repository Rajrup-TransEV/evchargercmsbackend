import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
import generatebill from "../../../../admin/crud/transactions/billgenerate.js";
import crypto from "crypto";
dotenv.config();

const prisma = new PrismaClient();

const ensureBillOnce = async (userid, sessionid) => {
  const existingBill = await prisma.userBilling.findFirst({
    where: {
      userid: userid,
      billingpdf: { contains: String(sessionid) },
    },
  });

  if (existingBill) {
    return "already_exists";
  }

  return await generatebill(userid, sessionid);
};

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

  const ASSOCIATED_ADMIN = process.env.ASSOCIATED_ADMIN;

  try {
    if (!sessionid) {
      return res.status(400).json({ message: "Missing sessionid in request body" });
    }

    if (!chargerid) {
      return res.status(400).json({ message: "Missing chargerid in request body" });
    }

    if (!userid) {
      return res.status(400).json({ message: "Missing userid in request body" });
    }

    // Idempotency: OCPP completed-transaction queue can retry after CMS already committed.
    const existingSession = await prisma.charingsessions.findFirst({
      where: { sessionid: String(sessionid) },
    });

    if (existingSession) {
      const billResult = await ensureBillOnce(userid, sessionid);
      return res.status(200).json({
        message: "Charging session already processed",
        already_processed: true,
        bill_result: billResult,
      });
    }

    const existingHistory = await prisma.transactionHistory.findFirst({
      where: { paymentid: `charge_${sessionid}` },
    });

    if (existingHistory) {
      return res.status(200).json({
        message: "Charging transaction history already processed",
        already_processed: true,
      });
    }

    await prisma.charger_Unit.findFirstOrThrow({
      where: { uid: chargerid },
    });

    const findhub = await prisma.addhub.findFirstOrThrow({
      where: {
        hubchargers: { array_contains: [chargerid] },
      },
    });

    const hubtariff = parseFloat(findhub.hubtariff);
    if (!Number.isFinite(hubtariff) || hubtariff <= 0) {
      return res.status(400).json({ message: "Invalid hub tariff" });
    }

    const minimumbalance = await prisma.minimumbalance.findFirst();
    if (!minimumbalance) {
      return res.status(404).json({ message: "No minimum balance found" });
    }

    const gstRecord = await prisma.gstCreate.findFirst();
    const gstPercent = parseFloat(gstRecord?.gst || "0");

    const hardLimitRecord = await prisma.walletHardLimit.findFirst();
    const hardLimit = parseFloat(hardLimitRecord?.hardlimit || "0");

    const walletdetails = await prisma.wallet.findFirstOrThrow({
      where: {
        OR: [
          { appuserrelatedwallet: userid },
          { userprofilerelatedwallet: userid },
        ],
      },
      select: { balance: true, uid: true },
    });

    const kwhConsumed =
      consumedkwh !== undefined && consumedkwh !== null
        ? parseFloat(consumedkwh)
        : (parseFloat(meterstop) - parseFloat(meterstart)) / 1000;

    if (!Number.isFinite(kwhConsumed) || kwhConsumed <= 0) {
      return res.status(400).json({ message: "Invalid kWh consumption" });
    }

    const totalCost = kwhConsumed * hubtariff;
    const taxableAmount = totalCost / (1 + gstPercent / 100);
    const gstAmount = totalCost - taxableAmount;

    const currentBalance = parseFloat(walletdetails.balance || "0");
    const projectedBalance = currentBalance - totalCost;

    // Final OCPP StopTransaction is accounting truth: energy has already been delivered.
    // Do not reject completion because of hard-limit overshoot.
    // Start-hook + OCPP auto-cutoff are responsible for preventing large overshoot upfront.
    // Rejecting here would make the OCPP retry queue repeat forever and leave billing incomplete.
    const belowHardLimit = projectedBalance < hardLimit;
    if (belowHardLimit) {
      logging(
        "warn",
        `OCPP finalization below hard limit for user ${userid}: projected ₹${projectedBalance.toFixed(2)}, hard limit ₹${hardLimit.toFixed(2)}`,
        "deductcalculate.js"
      );
    }

    const updatedBalance = projectedBalance.toFixed(2);

    const txResult = await prisma.$transaction(async (tx) => {
      const duplicateSession = await tx.charingsessions.findFirst({
        where: { sessionid: String(sessionid) },
      });

      if (duplicateSession) {
        return { alreadyProcessed: true };
      }

      const duplicateHistory = await tx.transactionHistory.findFirst({
        where: { paymentid: `charge_${sessionid}` },
      });

      if (duplicateHistory) {
        return { alreadyProcessed: true };
      }

      await tx.wallet.update({
        where: { uid: walletdetails.uid },
        data: {
          balance: updatedBalance.toString(),
        },
      });

      await tx.charingsessions.create({
        data: {
          uid: crypto.randomUUID(),
          sessionid: String(sessionid),
          chargerid,
          userid,
          startime: starttime,
          stoptime: stoptime,
          meterstart: String(meterstart),
          meterstop: String(meterstop),
          consumedkwh: kwhConsumed.toString(),
          totalcost: totalCost.toFixed(2),
          associatedadminid: ASSOCIATED_ADMIN,
        },
      });

      await tx.transactionHistory.create({
        data: {
          uid: crypto.randomUUID(),
          paymentid: `charge_${sessionid}`,
          walletid: walletdetails.uid,
          userid: userid,
          price: totalCost.toFixed(2),
          gst: gstAmount.toFixed(2),
          gstdeductedamount: gstAmount.toFixed(2),
          taxableamount: taxableAmount.toFixed(2),
          associatedadminid: ASSOCIATED_ADMIN,
        },
      });

      return { alreadyProcessed: false };
    });

    if (txResult.alreadyProcessed) {
      const billResult = await ensureBillOnce(userid, sessionid);
      return res.status(200).json({
        message: "Charging session already processed",
        already_processed: true,
        bill_result: billResult,
      });
    }

    const billResult = await ensureBillOnce(userid, sessionid);
    if (billResult == 1) {
      logging("info", `Billing generated for user ${userid}`, "billgenerate.js");
    } else if (billResult == 0) {
      logging("info", `Billing not generated for user ${userid}`, "billgenerate.js");
    } else {
      logging("info", `Billing generation failed for user ${userid}`, "billgenerate.js");
    }

    return res.status(200).json({
      message: "Charging session completed successfully",
      consumed: kwhConsumed,
      total_cost: totalCost.toFixed(2),
      taxable_amount: taxableAmount.toFixed(2),
      gst_charged: gstAmount.toFixed(2),
      remainingBalance: parseFloat(updatedBalance),
      bill_result: billResult,
    });
  } catch (error) {
    console.log("Error in deductcalculate: ", error);
    return res.status(500).json({ error: error.message });
  }
};

export default deductcalculate;
