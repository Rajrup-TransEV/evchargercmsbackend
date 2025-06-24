import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

const checkstartresponse = async (req, res) => {
    const {transactionid,userid,chargerid,connectorid} = req.body;
    try {
        savedata = await prisma.chargerTransaction.create({
            data: {
                uid: crypto.randomUUID(),
                chargerid: chargerid,
                userid: userid,
                transactionid: transactionid,
                connectorid: connectorid,
            }
        })
        
        return res.status(200).json({
            message: "Charging started",
        }); 
    } catch (error) {
        logging("charger_status_error", error.message, "chargerbookings.js");
        return res.status(500).json({ status: "Error", message: error.message });
    }
   
}

export default checkstartresponse