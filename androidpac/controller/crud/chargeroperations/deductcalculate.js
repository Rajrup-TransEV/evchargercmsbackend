import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
import generatebill from "../../../../admin/crud/transactions/billgenerate.js";
import crypto from "crypto";
dotenv.config();

const prisma = new PrismaClient();

const deductcalculate = async (req, res) => {
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
    if (!chargerid) {
      return res.status(400).json({ message: "Missing chargerid in request body" });
    }

    const findcharger = await prisma.charger_Unit.findFirstOrThrow({
      where: { uid: chargerid },
    });

    const findhub = await prisma.addhub.findFirstOrThrow({
      where: {
        hubchargers: { array_contains: [chargerid] },
      },
    });

    const hubtariff = parseFloat(findhub.hubtariff); // string → number

    const minimumbalance = await prisma.minimumbalance.findFirst();
    if (!minimumbalance) {
      return res.status(404).json({ message: "No minimum balance found" });
    }

    const gstRecord = await prisma.gstCreate.findFirst();
    const gstPercent = parseFloat(gstRecord?.gst || "0"); // string → number

    const hardLimitRecord = await prisma.walletHardLimit.findFirst();
    const hardLimit = parseFloat(hardLimitRecord?.hardlimit || "0"); // string → number

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
      consumedkwh ?? (parseFloat(meterstop) - parseFloat(meterstart)) / 1000;

    if (isNaN(kwhConsumed) || kwhConsumed <= 0) {
      return res.status(400).json({ message: "Invalid kWh consumption" });
    }

    const totalCost = kwhConsumed * hubtariff;

    const taxableAmount = totalCost / (1 + gstPercent / 100);
    const gstAmount = totalCost - taxableAmount;

    const currentBalance = parseFloat(walletdetails.balance || "0");

    const projectedBalance = currentBalance - totalCost;

    if (projectedBalance < hardLimit) {
      return res.status(400).json({
        message: `Insufficient wallet balance. Transaction would bring balance below the minimum hard limit of ₹${hardLimit.toFixed(2)}.`,
      });
    }

    const updatedBalance = projectedBalance.toFixed(2);

    await prisma.wallet.update({
      where: { uid: walletdetails.uid },
      data: {
        balance: updatedBalance.toString(),
      },
    });

    await prisma.charingsessions.create({
      data: {
        uid: crypto.randomUUID(),
        sessionid,
        chargerid,
        userid,
        startime: starttime,
        stoptime: stoptime,
        meterstart: meterstart,
        meterstop: meterstop,
        consumedkwh: kwhConsumed,
        totalcost: totalCost.toFixed(2),
        associatedadminid: ASSOCIATED_ADMIN,
      },
    });

    await prisma.transactionHistory.create({
      data: {
        uid: crypto.randomUUID(),
        paymentid: `charge_${sessionid}`,
        walletid: walletdetails.uid,
        userid: userid,
        price: totalCost.toFixed(2),
        gst: gstAmount.toFixed(2),
        gstdeductedamount:gstAmount.toFixed(2),
        taxableamount:taxableAmount.toFixed(2),
        associatedadminid: ASSOCIATED_ADMIN,
      },
    });

    const billResult = await generatebill(userid);
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
    });
  } catch (error) {
    console.log("Error in chargerstop: ", error);
    return res.status(500).json({ error: error.message });
  }
};

export default deductcalculate;
