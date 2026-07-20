import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
import crypto from "crypto";
import { calculateChargingLimit } from "../../../../lib/charging/pricing.js";
import { loadChargingPolicy } from "../../../../lib/charging/policy.js";
import {
  TRANSACTION_STATUS,
  isPrismaUniqueError,
  normalizeConnectorId,
  normalizeTransactionId,
} from "../../../../lib/charging/transaction-core.js";
dotenv.config();

const prisma = new PrismaClient();

const checkstartresponse = async (req, res) => {
  const apiauthkey = req.headers["apiauthkey"];
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { transactionid, userid, chargerid, connectorid } = req.body;
    if (
      transactionid === undefined ||
      transactionid === null ||
      !userid ||
      !chargerid ||
      connectorid === undefined ||
      connectorid === null
    ) {
      return res.status(400).json({ message: "Missing transactionid, userid, chargerid, or connectorid" });
    }

    const normalizedTransactionId = normalizeTransactionId(transactionid);
    const normalizedConnectorId = normalizeConnectorId(connectorid);
    const normalizedUserid = String(userid);
    const normalizedChargerid = String(chargerid);
    const existing = await prisma.chargerTransaction.findUnique({
      where: { transactionid: normalizedTransactionId },
    });

    if (existing) {
      if (
        existing.userid !== normalizedUserid ||
        existing.chargerid !== normalizedChargerid ||
        existing.connectorid !== normalizedConnectorId
      ) {
        return res.status(409).json({
          message: "Transaction ID is already assigned to a different charging session",
        });
      }
      return res.status(200).json({
        message: "Charging start already recorded",
        savedata: existing,
        max_kwh: existing.max_kwh,
        already_processed: true,
      });
    }

    let maxKwhText = "0.00";
    let gstValue = 0;
    let hardLimit = 0;
    let policyWarning;
    try {
      const policy = await loadChargingPolicy(prisma, {
        userid: normalizedUserid,
        chargerid: normalizedChargerid,
      });
      const limit = calculateChargingLimit({
        balance: policy.wallet.balance,
        hardLimit: policy.hardLimit,
        tariffPerKwh: policy.tariffPerKwh,
      });
      maxKwhText = limit.maxKwhText;
      gstValue = Number(policy.gstPercent || 0);
      hardLimit = Number(policy.hardLimit || 0);
    } catch (error) {
      // The charger-originated StartTransaction is still accounting truth. Persist it
      // and return a zero limit so the HAL requests a safe automatic stop.
      policyWarning = error.message;
      logging("charger_status_error", `Start policy unavailable: ${error.message}`, "checkstartresponse.js");
    }

    let savedata;
    try {
      savedata = await prisma.chargerTransaction.create({
        data: {
          uid: crypto.randomUUID(),
          chargerid: normalizedChargerid,
          userid: normalizedUserid,
          transactionid: normalizedTransactionId,
          connectorid: normalizedConnectorId,
          max_kwh: maxKwhText,
          status: TRANSACTION_STATUS.ACTIVE,
        },
      });
    } catch (error) {
      if (!isPrismaUniqueError(error)) throw error;
      savedata = await prisma.chargerTransaction.findUnique({
        where: { transactionid: normalizedTransactionId },
      });
      if (
        !savedata ||
        savedata.userid !== normalizedUserid ||
        savedata.chargerid !== normalizedChargerid ||
        savedata.connectorid !== normalizedConnectorId
      ) {
        return res.status(409).json({
          message: "Transaction ID is already assigned to a different charging session",
        });
      }
    }
    await prisma.chargingStartIntent.deleteMany({
      where: {
        userid: normalizedUserid,
        chargerid: normalizedChargerid,
        connectorid: normalizedConnectorId,
      },
    });

    return res.status(200).json({
      message: "Charging started",
      savedata: savedata,
      max_kwh: savedata.max_kwh,
      gst: gstValue.toFixed(2),
      wallet_hard_limit: hardLimit.toFixed(2),
      ...(policyWarning ? { policy_warning: policyWarning } : {}),
    });
  } catch (error) {
    if (error instanceof TypeError || error instanceof RangeError) {
      return res.status(400).json({ status: "Error", message: error.message });
    }
    logging("charger_status_error", error.message, "checkstartresponse.js");
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

export default checkstartresponse;
