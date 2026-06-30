import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

const getongoingtransaction = async (req, res) => {
  const { userid, chargerid, limit, stale_after_minutes } = req.body;

  try {
    if (!userid) {
      return res.status(400).json({ message: "Missing userid" });
    }

    const take = Math.min(Math.max(parseInt(limit || "20", 10) || 20, 1), 50);
    const staleAfterMinutes =
      Math.max(parseInt(stale_after_minutes || "720", 10) || 720, 1);

    const where = {
      userid: String(userid),
    };

    if (chargerid) {
      where.chargerid = String(chargerid);
    }

    const recentTransactions = await prisma.chargerTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      select: {
        uid: true,
        chargerid: true,
        userid: true,
        transactionid: true,
        connectorid: true,
        max_kwh: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    for (const tx of recentTransactions) {
      if (!tx.transactionid) continue;

      // In this system, OCPP completion callback sends:
      // deductcalculate.sessionid = OCPP transaction_id.
      // So if charingsessions has sessionid == tx.transactionid, it is finalized.
      const finalized = await prisma.charingsessions.findFirst({
        where: {
          sessionid: String(tx.transactionid),
        },
        select: {
          uid: true,
          sessionid: true,
          chargerid: true,
          userid: true,
          stoptime: true,
          meterstop: true,
          consumedkwh: true,
          totalcost: true,
          createdAt: true,
        },
      });

      if (finalized) continue;

      const startedAt = tx.createdAt ? new Date(tx.createdAt) : null;
      const ageMinutes =
        startedAt && !Number.isNaN(startedAt.getTime())
          ? Math.floor((Date.now() - startedAt.getTime()) / 60000)
          : null;

      const stale = ageMinutes !== null && ageMinutes > staleAfterMinutes;

      return res.status(200).json({
        message: stale
          ? "Possible stale ongoing charging transaction found"
          : "Ongoing charging transaction found",
        ongoing: true,
        can_request_stop: true,
        stale,
        age_minutes: ageMinutes,
        stale_after_minutes: staleAfterMinutes,
        transaction: {
          uid: tx.uid,
          chargerid: tx.chargerid,
          userid: tx.userid,
          transactionid: tx.transactionid,
          connectorid: tx.connectorid,
          max_kwh: tx.max_kwh,
          createdAt: tx.createdAt,
          updatedAt: tx.updatedAt,
        },
        manual_stop: {
          endpoint: "/users/chargerstop",
          method: "POST",
          body: {
            userid: tx.userid,
            chargerid: tx.chargerid,
          },
        },
        note:
          "This is CMS-known ongoing state: a ChargerTransaction exists without a matching finalized Charingsessions row.",
      });
    }

    return res.status(404).json({
      message: "No ongoing charging transaction found",
      ongoing: false,
      checked_recent_transactions: recentTransactions.length,
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
