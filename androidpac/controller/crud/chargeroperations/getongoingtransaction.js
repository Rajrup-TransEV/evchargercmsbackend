import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { resolveTransactionUser } from "../../../../lib/charging/request-identity.js";
import {
  CURRENT_TRANSACTION_STATUSES,
  TRANSACTION_STATUS,
} from "../../../../lib/charging/transaction-core.js";
dotenv.config();

const prisma = new PrismaClient();

const getongoingtransaction = async (req, res) => {
  const { userid, chargerid, stale_after_minutes } = req.body;

  try {
    const identity = resolveTransactionUser(req, userid);
    if (!identity.ok) {
      return res.status(identity.status).json({ message: identity.message });
    }

    const staleAfterMinutes = Math.max(
      parseInt(stale_after_minutes || "720", 10) || 720,
      1
    );
    const where = {
      userid: identity.userid,
      status: { in: CURRENT_TRANSACTION_STATUSES },
      ...(chargerid ? { chargerid: String(chargerid) } : {}),
    };
    const activeTransactions = await prisma.chargerTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        uid: true,
        chargerid: true,
        userid: true,
        transactionid: true,
        connectorid: true,
        max_kwh: true,
        status: true,
        stopattempts: true,
        stoprequestedat: true,
        laststoperror: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (activeTransactions.length === 0) {
      return res.status(404).json({
        message: "No ongoing charging transaction found",
        ongoing: false,
        checked_recent_transactions: 0,
      });
    }

    const tx = activeTransactions[0];
    const ageMinutes = Math.max(
      Math.floor((Date.now() - new Date(tx.createdAt).getTime()) / 60_000),
      0
    );
    const stale = ageMinutes > staleAfterMinutes;
    const ambiguous = activeTransactions.length > 1;
    const canRequestStop =
      tx.status !== TRANSACTION_STATUS.RECONCILE_REQUIRED;

    return res.status(200).json({
      message: ambiguous
        ? "Multiple ongoing charging transactions require reconciliation"
        : stale
          ? "Possible stale ongoing charging transaction found"
          : "Ongoing charging transaction found",
      ongoing: true,
      can_request_stop: canRequestStop,
      stale,
      age_minutes: ageMinutes,
      stale_after_minutes: staleAfterMinutes,
      ambiguous,
      transaction: tx,
      transaction_count: activeTransactions.length,
      ongoing_transactions: activeTransactions,
      manual_stop: {
        endpoint: "/users/chargerstop",
        method: "POST",
        body: {
          userid: tx.userid,
          chargerid: tx.chargerid,
          transactionid: tx.transactionid,
        },
      },
      note:
        "CMS lifecycle state is keyed by the exact OCPP transaction ID; only the completion callback marks it completed.",
      identity_source: identity.source,
    });
  } catch (error) {
    console.error("getongoingtransaction error:", error);
    return res.status(500).json({
      message: "Failed to fetch ongoing charging transaction",
      error: error.message,
    });
  }
};

export default getongoingtransaction;
