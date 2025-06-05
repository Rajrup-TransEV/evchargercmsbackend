import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";

const prisma = new PrismaClient();
const chargerstop = async(req,res)=>{
    const {userid,chargerid,useraccept}=req.body;
    try {
        const connectorstatecheck = {
            uid: chargerid,
          };
          const startresponse = await fetch("http://172.236.164.175:80/api/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
            userid: userid,
            useraccept: useraccept,
            connector_id: connectoravailability?.connector_id,
            type: "Inoperative",
        }
        const response = await fetch("http://172.236.164.175:80/api/change_availability", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });
          const result = await response.json();
          logging("charger_status_change", JSON.stringify(result), "chargerbookings.js");
    } catch (error) {
        console.log(error)    
    }
}

export default chargerstop
