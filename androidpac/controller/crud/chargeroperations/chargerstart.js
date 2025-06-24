import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
dotenv.config();

const setChargerStart = async (req, res) => {
  
const EXTERNAL_URI = process.env.EXTERNAL_URI
console.log("EXTERNAL_URI",EXTERNAL_URI)
const OCPP_API_KEY = process.env.OCPP_API_KEY;
console.log("OCPP_API_KEY",OCPP_API_KEY)
  try {
   
    const { chargerUid, userid,useraccept, type } = req.body;
    const connectorstatecheck = {
      uid: chargerUid,
    };
    const startresponse = await fetch(`${EXTERNAL_URI}/api/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        "x-api-key":OCPP_API_KEY
       },
      body: JSON.stringify(connectorstatecheck),
    });
    const connectoravailability = await startresponse.json();
    if (connectoravailability?.status?.toLowerCase() !== "available") {
      return res.status(400).json({ message: "Charger is not available" });
    }
    if (connectoravailability?.status?.toLowerCase() !== "operative") {
      return res.status(400).json({ message: "Charger is not operative" });
    }
    if (connectoravailability?.status?.toLowerCase() == "busy"){
        return res.status(400).json({ message: "Charger endpoint is busy" });
    }
    const connectorid = connectoravailability?.connector_id;

    const requestBody = {
      uid: chargerUid,
      userid: userid,
      useraccept: useraccept,
      connector_id: connectorid,
    };
    if (useraccept == "true"){
    const response = await fetch(`${EXTERNAL_URI}/api/start_transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        "x-api-key":OCPP_API_KEY
       },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    logging("charger_status_change", JSON.stringify(result), "chargerbookings.js");

    const status = result?.status?.toLowerCase();

    if (status === "accepted" || status === "success") {
      return res.status(200).json({ message: "Charging started" });
    } else {
      return res.status(400).json({ message: "Something went wrong. Please try again." });
    }
    }
  } catch (err) {
    logging("charger_status_error", err.message, "chargerbookings.js");
    return res.status(500).json({ status: "Error", message: err.message });
  }

};

export default setChargerStart;