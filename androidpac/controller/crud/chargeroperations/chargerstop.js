import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { requestRemoteStop } from "../../../../lib/charging/remote-stop.js";
import { resolveTransactionUser } from "../../../../lib/charging/request-identity.js";
import {
  CURRENT_TRANSACTION_STATUSES,
  TRANSACTION_STATUS,
  normalizeTransactionId,
} from "../../../../lib/charging/transaction-core.js";
dotenv.config();

const prisma = new PrismaClient();

const chargerstop = async (req, res) => {
  const { chargerid, userid, transactionid } = req.body;

  try {
    if (!chargerid || !userid) {
      return res.status(400).json({ message: "Missing chargerid or userid" });
    }

    const identity = resolveTransactionUser(req, userid);
    if (!identity.ok) {
      return res.status(identity.status).json({ message: identity.message });
    }

    let stoptransaction;
    let legacyResolution = false;
    if (transactionid !== undefined && transactionid !== null && transactionid !== "") {
      const normalizedTransactionId = normalizeTransactionId(transactionid);
      stoptransaction = await prisma.chargerTransaction.findUnique({
        where: { transactionid: normalizedTransactionId },
      });
      if (
        !stoptransaction ||
        stoptransaction.userid !== identity.userid ||
        stoptransaction.chargerid !== String(chargerid)
      ) {
        return res.status(404).json({ message: "Charging transaction not found" });
      }
    } else {
      // Temporary downstream compatibility: missing transactionid is only safe when
      // exactly one current row matches. It never falls back to "latest".
      const candidates = await prisma.chargerTransaction.findMany({
        where: {
          chargerid: String(chargerid),
          userid: identity.userid,
          status: { in: CURRENT_TRANSACTION_STATUSES },
        },
        take: 2,
      });
      if (candidates.length === 0) {
        return res.status(404).json({ message: "No ongoing charging transaction found" });
      }
      if (candidates.length !== 1) {
        return res.status(409).json({
          message: "Multiple ongoing transactions found; transactionid is required",
        });
      }
      [stoptransaction] = candidates;
      legacyResolution = true;
    }

    if (stoptransaction.status === TRANSACTION_STATUS.COMPLETED) {
      return res.status(200).json({
        message: "Charging transaction is already completed",
        status: "completed",
        transactionid: stoptransaction.transactionid,
        already_processed: true,
        identity_source: identity.source,
      });
    }

    if (
      stoptransaction.status === TRANSACTION_STATUS.UNKNOWN &&
      (transactionid === undefined || transactionid === null || transactionid === "")
    ) {
      return res.status(409).json({
        message: "Legacy transaction state is unknown; exact transactionid is required",
      });
    }

    const result = await requestRemoteStop(prisma, stoptransaction);
    if (result.ok) {
      return res.status(200).json({
        message: result.completed
          ? "Charging transaction is already completed"
          : "Charger stop requested",
        status: result.status,
        transactionid: stoptransaction.transactionid,
        ...(legacyResolution ? { legacy_transaction_resolution: true } : {}),
        identity_source: identity.source,
      });
    }

    return res.status(400).json({
      message: "Charger stop request rejected",
      status: result.status,
      detail: result.detail,
      transactionid: stoptransaction.transactionid,
      retry_scheduled: true,
      identity_source: identity.source,
    });
  } catch (error) {
    console.log(error);
    if (error instanceof TypeError || error instanceof RangeError) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({
      message: "Charger stop request failed",
      error: error.message,
    });
  }
};

export default chargerstop;
