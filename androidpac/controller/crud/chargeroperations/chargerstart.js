import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

const setChargerStart = async (req, res) => {
  const EXTERNAL_URI = process.env.EXTERNAL_URI;
  const OCPP_API_KEY = process.env.OCPP_API_KEY;

  try {
    const { chargerUid, userid, useraccept } = req.body;

    // 1. Fetch charger status
    const statusRes = await fetch(`${EXTERNAL_URI}/api/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": OCPP_API_KEY,
      },
      body: JSON.stringify({ uid: chargerUid }),
    });

    const statusData = await statusRes.json();
    const connectorid = statusData?.connector_id;

   

    // 5. Send to /start_transaction if accepted
    if (useraccept === "true") {
      const startRes = await fetch(`${EXTERNAL_URI}/api/start_transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": OCPP_API_KEY,
        },
        body: JSON.stringify({
          uid: chargerUid,
          id_tag: userid,
          connector_id: connectorid
        }),
      });

      const result = await startRes.json();
      logging("charger_status_change", JSON.stringify(result), "chargerbookings.js");

      const resultStatus = result?.status?.toLowerCase();
      if (resultStatus === "accepted" || resultStatus === "success") {
        
        return res.status(200).json({
          message: "Charging started",
          max_kwh: kwh.toFixed(2),
        });
      } else {
        return res.status(400).json({ message: "Charging could not be started." });
      }
    } else {
      return res.status(200).json({
        message: "kWh calculated from wallet",
        max_kwh: kwh.toFixed(2),
      });
    }

  } catch (err) {
    logging("charger_status_error", err.message, "chargerbookings.js");
    return res.status(500).json({ status: "Error", message: err.message });
  }
};

export default setChargerStart;
