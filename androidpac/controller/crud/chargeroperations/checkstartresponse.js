import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

const checkstartresponse = async (req, res) => {
    const {transactionid,userid,chargerid,connectorid} = req.body;
    try {
         // 2. Fetch hub tariff
         const findhub = await prisma.addhub.findFirstOrThrow({
          where: {
            hubchargers: { array_contains: [chargerid] },
          },
        });
    
      const tariffPerKwh = findhub.hubtariff;
  
      // 3. Fetch wallet balance
      const wallet = await prisma.wallet.findFirstOrThrow({
        where: {
          OR: [
            { appuserrelatedwallet: userid },
            { userprofilerelatedwallet: userid },
          ],
        },
        select: { balance: true },
      });
      const balance = wallet.balance;
  
      // 4. Calculate max kWh (wallet / tariff)
      const kwh = balance / tariffPerKwh;
      const  savedata = await prisma.chargerTransaction.create({
            data: {
                uid: crypto.randomUUID(),
                chargerid: chargerid,
                userid: userid,
                transactionid: transactionid,
                connectorid: connectorid,
                max_kwh: kwh.toFixed(2),
            }
        })
        
        return res.status(200).json({
            message: "Charging started",
            "savedata":savedata,
            max_kwh: kwh.toFixed(2),
        }); 
    } catch (error) {
        logging("charger_status_error", error.message, "chargerbookings.js");
        return res.status(500).json({ status: "Error", message: error.message });
    }
   
}

export default checkstartresponse