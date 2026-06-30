import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
const EXTERNAL_URI = process.env.EXTERNAL_URI;
const OCPP_API_KEY = process.env.OCPP_API_KEY;

const chargerstop = async (req, res) => {
  const { chargerid, userid } = req.body;

  try {
    if (!chargerid || !userid) {
      return res.status(400).json({ message: "Missing chargerid or userid" });
    }

    const stoptransaction = await prisma.chargerTransaction.findFirstOrThrow({
      where: {
        AND: [{ chargerid: chargerid }, { userid: userid }],
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        uid: true,
        transactionid: true,
        connectorid: true,
        max_kwh: true,
      },
    });

    const requestBody = {
      uid: chargerid,
      id_tag: userid,
      connector_id: stoptransaction.connectorid,
      transaction_id: stoptransaction.transactionid,
      max_kwh: stoptransaction.max_kwh,
    };

    const response = await fetch(`${EXTERNAL_URI}/api/stop_transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": OCPP_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    let result = {};
    try {
      result = await response.json();
    } catch (_) {
      result = {};
    }

    const status = String(result?.status || "").toLowerCase();

    // RemoteStopTransaction Accepted means the stop command was accepted.
    // Actual billing/wallet mutation happens later through charger StopTransaction -> /users/deductcalculate.
    if (response.ok && (status === "accepted" || status === "success")) {
      return res.status(200).json({
        message: "Charger stop requested",
        status: result.status,
        transactionid: stoptransaction.transactionid,
      });
    }

    return res.status(400).json({
      message: "Charger stop request rejected",
      status: result?.status,
      detail: result?.detail,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Charger stop request failed", error: error.message });
  }
};

export default chargerstop;
