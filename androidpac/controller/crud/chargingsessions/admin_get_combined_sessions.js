// // admin_get_combined_sessions.js

// import { PrismaClient } from "@prisma/client";
// import logging from "../../../../logging/logging_generate.js";
// import dotenv from "dotenv";
// dotenv.config();

// const prisma = new PrismaClient();

// const adminGetCombinedChargingSessions = async (req, res) => {
//   // Optional auth (keep if your API uses it)
//   const apiauthkey = req.headers["apiauthkey"];
//   if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
//     logging("error", "API route access forbidden", "admin_get_combined_sessions.js");
//     return res.status(403).json({ message: "API route access forbidden" });
//   }

//   const { adminuid, page, limit } = req.body;

//   if (!adminuid) {
//     return res.status(400).json({ message: "Missing adminuid in request body" });
//   }

//   const take = Math.min(parseInt(limit ?? "50", 10) || 50, 200);
//   const currentPage = parseInt(page ?? "1", 10) || 1;
//   const skip = (currentPage - 1) * take;

//   try {
//     // 1) Fetch sessions for that admin
//     const sessions = await prisma.charingsessions.findMany({
//       where: { associatedadminid: adminuid },
//       orderBy: { createdAt: "desc" },
//       skip,
//       take,
//     });

//     const sessionIds = sessions
//       .map((s) => s.sessionid)
//       .filter((x) => x !== null && x !== undefined && String(x).trim() !== "")
//       .map((x) => String(x));

//     if (sessionIds.length === 0) {
//       return res.status(200).json({
//         message: "No sessions found",
//         adminuid,
//         combined: [],
//         invalid: [],
//       });
//     }

//     // 2) Fetch all transactionHistory rows that correspond to those sessions
//     // Mapping: paymentid = `charge_${sessionid}`
//     const paymentIds = sessionIds.map((sid) => `charge_${sid}`);

//     const transactions = await prisma.transactionHistory.findMany({
//       where: {
//         associatedadminid: adminuid,
//         paymentid: { in: paymentIds },
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     // 3) Index transactions by sessionid (derived from paymentid)
//     const txnBySessionId = new Map();
//     for (const t of transactions) {
//       const pid = String(t.paymentid ?? "");
//       if (pid.startsWith("charge_")) {
//         const sid = pid.slice("charge_".length);
//         // If duplicates exist, keep the latest one by createdAt ordering above
//         if (!txnBySessionId.has(sid)) txnBySessionId.set(sid, t);
//       }
//     }

//     // 4) Combine. If either side missing => invalid.
//     const combined = [];
//     const invalid = [];

//     for (const s of sessions) {
//       const sid = String(s.sessionid ?? "").trim();
//       if (!sid) {
//         invalid.push({ sessionid: null, reason: "Session row missing sessionid", session: s });
//         continue;
//       }

//       const txn = txnBySessionId.get(sid);
//       if (!txn) {
//         invalid.push({ sessionid: sid, reason: "No transactionHistory for sessionid", session: s });
//         continue;
//       }

//       combined.push({
//         sessionid: sid,
//         session: s,
//         transaction: txn,
//       });
//     }

//     return res.status(200).json({
//       message: "Combined sessions fetched successfully",
//       adminuid,
//       pagination: {
//         page: currentPage,
//         limit: take,
//         returned_sessions: sessions.length,
//         valid_count: combined.length,
//         invalid_count: invalid.length,
//       },
//       combined, // ✅ only valid pairs
//       invalid,  // ✅ everything missing a pair (invalid by your rule)
//     });
//   } catch (error) {
//     console.log(error);
//     logging("error", error.message, "admin_get_combined_sessions.js");
//     return res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };

// export default adminGetCombinedChargingSessions;

// admin_get_combined_sessions.js

import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

const adminGetCombinedChargingSessions = async (req, res) => {
  // Auth check
  const apiauthkey = req.headers["apiauthkey"];
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    logging("error", "API route access forbidden", "admin_get_combined_sessions.js");
    return res.status(403).json({ message: "API route access forbidden" });
  }

  const { adminuid, page, limit } = req.body;

  if (!adminuid) {
    return res.status(400).json({ message: "Missing adminuid in request body" });
  }

  const take = Math.min(parseInt(limit ?? "50", 10) || 50, 200);
  const currentPage = parseInt(page ?? "1", 10) || 1;
  const skip = (currentPage - 1) * take;

  try {
    // 1) Fetch charging sessions for admin
    const sessions = await prisma.charingsessions.findMany({
      where: { associatedadminid: adminuid },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });

    // Collect session IDs
    const sessionIds = sessions
      .map((s) => s.sessionid)
      .filter((x) => x !== null && x !== undefined && String(x).trim() !== "")
      .map((x) => String(x));

    // Collect user IDs from sessions
    const userIds = [
      ...new Set(
        sessions
          .map((s) => s.userid)
          .filter((u) => u !== null && u !== undefined && String(u).trim() !== "")
          .map((u) => String(u))
      ),
    ];

    // Fetch users (uid → username)
    const users = await prisma.user.findMany({
      where: {
        uid: { in: userIds },
      },
      select: {
        uid: true,
        username: true,
      },
    });

    const userNameById = new Map();
    for (const u of users) {
      userNameById.set(String(u.uid), u.username);
    }

    if (sessionIds.length === 0) {
      return res.status(200).json({
        message: "No sessions found",
        adminuid,
        combined: [],
        invalid: [],
      });
    }

    // 2) Fetch matching transactionHistory rows
    // Mapping: paymentid = `charge_${sessionid}`
    const paymentIds = sessionIds.map((sid) => `charge_${sid}`);

    const transactions = await prisma.transactionHistory.findMany({
      where: {
        associatedadminid: adminuid,
        paymentid: { in: paymentIds },
      },
      orderBy: { createdAt: "desc" },
    });

    // 3) Index transactions by sessionid
    const txnBySessionId = new Map();
    for (const t of transactions) {
      const pid = String(t.paymentid ?? "");
      if (pid.startsWith("charge_")) {
        const sid = pid.slice("charge_".length);
        if (!txnBySessionId.has(sid)) {
          txnBySessionId.set(sid, t);
        }
      }
    }

    // 4) Combine results
    const combined = [];
    const invalid = [];

    for (const s of sessions) {
      const sid = String(s.sessionid ?? "").trim();
      if (!sid) {
        invalid.push({
          sessionid: null,
          username: userNameById.get(String(s.userid)) ?? null,
          reason: "Session row missing sessionid",
          session: s,
        });
        continue;
      }

      const txn = txnBySessionId.get(sid);
      if (!txn) {
        invalid.push({
          sessionid: sid,
          username: userNameById.get(String(s.userid)) ?? null,
          reason: "No transactionHistory for sessionid",
          session: s,
        });
        continue;
      }

      combined.push({
        sessionid: sid,
        username: userNameById.get(String(s.userid)) ?? null,
        session: s,
        transaction: txn,
      });
    }

    return res.status(200).json({
      message: "Combined sessions fetched successfully",
      adminuid,
      pagination: {
        page: currentPage,
        limit: take,
        returned_sessions: sessions.length,
        valid_count: combined.length,
        invalid_count: invalid.length,
      },
      combined,
      invalid,
    });
  } catch (error) {
    console.log(error);
    logging("error", error.message, "admin_get_combined_sessions.js");
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default adminGetCombinedChargingSessions;
