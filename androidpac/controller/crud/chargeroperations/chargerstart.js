import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

const setChargerStart = async (req, res) => {
  const EXTERNAL_URI = process.env.EXTERNAL_URI;
  const OCPP_API_KEY = process.env.OCPP_API_KEY;

  try {
    const { chargerid, userid, useraccept,connectorid } = req.body;

    if (useraccept === "true") {
      console.log("user accepted but not working")
      const startRes = await fetch(`${EXTERNAL_URI}/api/start_transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": OCPP_API_KEY,
        },
        body: JSON.stringify({
          uid: chargerid,
          id_tag: userid,
          connector_id: connectorid
        }),
      });

      const result = await startRes.json();
      console.log("result",result)
      logging("charger_status_change", "charger in operative","chargerstart.js");

      const resultStatus = result?.status?.toLowerCase();
      console.log(resultStatus)
      if (resultStatus === "accepted" || resultStatus === "success") {   
        console.log("Charging started")
        return res.status(200).json({
          message: "Charging started",
        });
      } else {
        console.log("Charging could not be started")
        return res.status(400).json({ message: "Charging could not be started." });
      }
    }

  } catch (err) {
    console.log(err.message)
    logging("charger_status_error", err.message, "chargerbookings.js");
    return res.status(500).json({ status: "Error", message: err.message });
  }
};

export default setChargerStart;
