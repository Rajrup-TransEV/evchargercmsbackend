import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
dotenv.config();

const setChargerOperative = async (req, res) => {
  
const EXTERNAL_URI = process.env.EXTERNAL_URI

const OCPP_API_KEY = process.env.OCPP_API_KEY;

  try {
   
    const { chargerUid, userid,useraccept,connectorid,type } = req.body;

    const requestBody = {
      uid: chargerUid,
      userid: userid,
      useraccept: useraccept,
      connector_id: connectorid,
      type: type
    };
    
    const response = await fetch(`${EXTERNAL_URI}/api/change_availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        "x-api-key":OCPP_API_KEY
       },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    logging("charger_status_change", JSON.stringify(result), "chargerbookings.js");

    const status = result?.status?.toLowerCase();
    return res.status(200).json({message:"Charger status changed successfully"})
  } catch (err) {
    logging("charger_status_error", err.message, "chargerbookings.js");
    return res.status(500).json({ status: "Error", message: err.message });
  }

};

export default setChargerOperative;