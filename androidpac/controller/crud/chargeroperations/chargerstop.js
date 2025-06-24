import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
const EXTERNAL_URI = process.env.EXTERNAL_URI
const OCPP_API_KEY = process.env.OCPP_API_KEY;
const chargerstop = async(req,res)=>{
    const {userid,chargerid,useraccept}=req.body;
    try {
        const connectorstatecheck = {
            uid: chargerid,
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
        const requestBody ={
            uid: chargerid,
            id_tag: userid,
            connector_id: connectoravailability?.connector_id,
        }
        const response = await fetch(`${EXTERNAL_URI}/api/change_availability`, {
            method: "POST",
            headers: { "Content-Type": "application/json",
              "x-api-key":OCPP_API_KEY
             },
            body: JSON.stringify(requestBody),
          });
          const result = await response.json();
          logging("charger_status_change", JSON.stringify(result), "chargerbookings.js");
    } catch (error) {
        console.log(error)    
    }
}

export default chargerstop
