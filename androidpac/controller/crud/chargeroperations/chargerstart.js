import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
import { calculateChargingLimit } from "../../../../lib/charging/pricing.js";
import { loadChargingPolicy } from "../../../../lib/charging/policy.js";
import { resolveTransactionUser } from "../../../../lib/charging/request-identity.js";
import {
  CURRENT_TRANSACTION_STATUSES,
  isPrismaUniqueError,
  normalizeConnectorId,
} from "../../../../lib/charging/transaction-core.js";
dotenv.config();

const prisma = new PrismaClient();

const setChargerStart = async (req, res) => {
  console.log("set charger start function is running")
  const EXTERNAL_URI = process.env.EXTERNAL_URI;
  const OCPP_API_KEY = process.env.OCPP_API_KEY;

  try {
    const { chargerid, userid, useraccept, connectorid } = req.body;
    if (!chargerid || !userid || connectorid === undefined || connectorid === null) {
      return res.status(400).json({ message: "Missing chargerid, userid, or connectorid" });
    }
    if (!(useraccept === true || useraccept === "true")) {
      return res.status(400).json({ message: "User acceptance is required to start charging" });
    }

    const identity = resolveTransactionUser(req, userid);
    if (!identity.ok) {
      return res.status(identity.status).json({ message: identity.message });
    }
    const normalizedConnectorId = normalizeConnectorId(connectorid);
    const policy = await loadChargingPolicy(prisma, {
      userid: identity.userid,
      chargerid: String(chargerid),
    });
    const limit = calculateChargingLimit({
      balance: policy.wallet.balance,
      hardLimit: policy.hardLimit,
      tariffPerKwh: policy.tariffPerKwh,
    });
    if (limit.maxKwh <= 0) {
      return res.status(400).json({
        message: "Wallet balance is not sufficient to start charging. Please recharge",
      });
    }

    const active = await prisma.chargerTransaction.findFirst({
      where: {
        userid: identity.userid,
        status: { in: CURRENT_TRANSACTION_STATUSES },
      },
      select: { transactionid: true, chargerid: true },
    });
    if (active) {
      return res.status(409).json({
        message: "User already has an ongoing charging transaction",
        transactionid: active.transactionid,
        chargerid: active.chargerid,
      });
    }

    await prisma.chargingStartIntent.deleteMany({
      where: { userid: identity.userid, expiresat: { lte: new Date() } },
    });
    let startIntent;
    try {
      startIntent = await prisma.chargingStartIntent.create({
        data: {
          userid: identity.userid,
          chargerid: String(chargerid),
          connectorid: normalizedConnectorId,
          expiresat: new Date(
            Date.now() +
              Math.max(
                Number(process.env.START_INTENT_TTL_MS) || 10 * 60_000,
                60_000
              )
          ),
        },
      });
    } catch (error) {
      if (!isPrismaUniqueError(error)) throw error;
      const existingIntent = await prisma.chargingStartIntent.findFirst({
        where: {
          OR: [
            { userid: identity.userid },
            {
              chargerid: String(chargerid),
              connectorid: normalizedConnectorId,
            },
          ],
        },
      });
      return res.status(409).json({
        message: "A charging start request is already in progress",
        chargerid: existingIntent?.chargerid,
        connectorid: existingIntent?.connectorid,
      });
    }

    try {
      const startRes = await fetch(`${EXTERNAL_URI}/api/start_transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": OCPP_API_KEY,
        },
        body: JSON.stringify({
          uid: chargerid,
          id_tag: identity.userid,
          connector_id: normalizedConnectorId
        }),
        signal: AbortSignal.timeout(
          Math.max(Number(process.env.OCPP_HTTP_TIMEOUT_MS) || 15_000, 1_000)
        ),
      });

      const responseText = await startRes.text();
      let result = {};
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        result = { detail: responseText.slice(0, 500) };
      }
      console.log("result",result)
      logging("charger_status_change", "charger in operative","chargerstart.js");

      const resultStatus = result?.status?.toLowerCase();
      console.log(resultStatus)
      if (startRes.ok && (resultStatus === "accepted" || resultStatus === "success")) {
        await prisma.chargingStartIntent.update({
          where: { id: startIntent.id },
          data: { status: "AWAITING_START" },
        });
        console.log("Charging started")
        return res.status(200).json({
          message: "Charging started",
          identity_source: identity.source,
        });
      } else {
        await prisma.chargingStartIntent.deleteMany({
          where: { id: startIntent.id },
        });
        console.log("Charging could not be started")
        return res.status(400).json({
          message: "Charging could not be started.",
          status: result?.status,
          detail: result?.detail,
        });
      }
    } catch (error) {
      await prisma.chargingStartIntent.deleteMany({
        where: { id: startIntent.id },
      });
      throw error;
    }
  } catch (err) {
    console.log(err.message)
    logging("charger_status_error", err.message, "chargerbookings.js");
    const status =
      err instanceof TypeError || err instanceof RangeError ? 400 : 500;
    return res.status(status).json({ status: "Error", message: err.message });
  }
};

export default setChargerStart;
