import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

const prisma = new PrismaClient();

const checkstartresponse = async (req, res) => {
  const apiauthkey = req.headers["apiauthkey"];
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { transactionid, userid, chargerid, connectorid } = req.body;

  try {
    if (!transactionid || !userid || !chargerid || !connectorid) {
      return res.status(400).json({ message: "Missing transactionid, userid, chargerid, or connectorid" });
    }

    // Idempotency for OCPP start-hook retries.
    const existing = await prisma.chargerTransaction.findFirst({
      where: {
        transactionid: String(transactionid),
        chargerid: chargerid,
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return res.status(200).json({
        message: "Charging start already recorded",
        savedata: existing,
        max_kwh: existing.max_kwh,
        already_processed: true,
      });
    }

    const gstRecord = await prisma.gstCreate.findFirst();
    const wallethardlimitRecord = await prisma.walletHardLimit.findFirst();

    const gstValue = parseFloat(gstRecord?.gst || "0");
    const hardLimit = parseFloat(wallethardlimitRecord?.hardlimit || "0");

    const findhub = await prisma.addhub.findFirstOrThrow({
      where: {
        hubchargers: { array_contains: [chargerid] },
      },
    });

    const tariffPerKwh = parseFloat(findhub?.hubtariff || "0");

    if (!Number.isFinite(tariffPerKwh) || tariffPerKwh <= 0) {
      return res.status(400).json({ message: "Invalid hub tariff" });
    }

    const wallet = await prisma.wallet.findFirstOrThrow({
      where: {
        OR: [
          { appuserrelatedwallet: userid },
          { userprofilerelatedwallet: userid },
        ],
      },
      select: { balance: true },
    });

    const balance = parseFloat(wallet?.balance || "0");

    const denominator = tariffPerKwh * (1 + gstValue / 100);
    const usableBalance = Math.max(balance - hardLimit, 0);
    const kwh = usableBalance / denominator;

    const savedata = await prisma.chargerTransaction.create({
      data: {
        uid: crypto.randomUUID(),
        chargerid: chargerid,
        userid: userid,
        transactionid: String(transactionid),
        connectorid: String(connectorid),
        max_kwh: kwh.toFixed(2),
      },
    });

    return res.status(200).json({
      message: "Charging started",
      savedata: savedata,
      max_kwh: kwh.toFixed(2),
      gst: gstValue.toFixed(2),
      wallet_hard_limit: hardLimit.toFixed(2),
    });
  } catch (error) {
    logging("charger_status_error", error.message, "checkstartresponse.js");
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

export default checkstartresponse;
