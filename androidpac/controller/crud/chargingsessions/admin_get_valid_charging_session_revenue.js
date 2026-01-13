import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

const adminGetValidChargingSessionRevenue = async (req, res) => {
  const apiauthkey = req.headers["apiauthkey"];
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    logging("error", "API route access forbidden", "admingetvalidchargingsessionrevenue.js");
    return res.status(403).json({ message: "API route access forbidden" });
  }

  const { adminuid, from, to } = req.body;

  if (!adminuid) {
    return res.status(400).json({ message: "Missing adminuid in request body" });
  }

  try {
    // 1) Get sessions for admin (optionally date-filtered on startime if you want)
    const sessionWhere = { associatedadminid: adminuid };
    if (from || to) {
      sessionWhere.startime = {};
      if (from) sessionWhere.startime.gte = new Date(from);
      if (to) sessionWhere.startime.lte = new Date(to);
    }

    const sessions = await prisma.charingsessions.findMany({
      where: sessionWhere,
      select: { sessionid: true },
      orderBy: { createdAt: "desc" },
    });

    const sessionIds = sessions
      .map((s) => s.sessionid)
      .filter((x) => x !== null && x !== undefined && String(x).trim() !== "")
      .map((x) => String(x));

    if (sessionIds.length === 0) {
      return res.status(200).json({
        message: "No sessions found",
        adminuid,
        total_revenue: 0,
        valid_count: 0,
        invalid_count_sessions_missing_txn: 0,
      });
    }

    // 2) Build payment ids for those sessions (your contract)
    const paymentIds = sessionIds.map((sid) => `charge_${sid}`);

    // 3) Fetch only matching transactions (this guarantees session exists)
    const txnWhere = {
      associatedadminid: adminuid,
      paymentid: { in: paymentIds },
    };

    // Optional date filter for transactions on createdAt (if needed)
    if (from || to) {
      txnWhere.createdAt = {};
      if (from) txnWhere.createdAt.gte = new Date(from);
      if (to) txnWhere.createdAt.lte = new Date(to);
    }

    const txns = await prisma.transactionHistory.findMany({
      where: txnWhere,
      select: { paymentid: true, price: true },
      orderBy: { createdAt: "desc" },
    });

    // 4) Compute revenue (price is likely stored as string)
    let totalRevenue = 0;
    const matchedSessionIds = new Set();

    for (const t of txns) {
      const pid = String(t.paymentid ?? "");
      if (!pid.startsWith("charge_")) continue;

      const sid = pid.slice("charge_".length);
      matchedSessionIds.add(sid);

      const priceNum = parseFloat(String(t.price ?? "0"));
      if (!Number.isFinite(priceNum)) continue;

      totalRevenue += priceNum;
    }

    const validCount = matchedSessionIds.size;
    const invalidCount = sessionIds.length - validCount;

    return res.status(200).json({
      message: "Valid charging session revenue computed successfully",
      adminuid,
      total_revenue: Number(totalRevenue.toFixed(2)),
      valid_count: validCount,
      invalid_count_sessions_missing_txn: invalidCount,
    });
  } catch (error) {
    console.log(error);
    logging("error", error.message, "admingetvalidchargingsessionrevenue.js");
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export default adminGetValidChargingSessionRevenue;
