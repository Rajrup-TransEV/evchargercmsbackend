import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
const EXTERNAL_URI = process.env.EXTERNAL_URI
const OCPP_API_KEY = process.env.OCPP_API_KEY;
const chargerstop = async(req,res)=>{
    const { chargerUid, userid}=req.body;
    try {
          const stoptransaction = await prisma.chargerTransaction.findFirstOrThrow({
            where:{
              AND:[
                {
                  chargerid:chargerUid
                },
                {
                  userid:userid
                }
              ]
            },
            orderBy:{
              createdAt:"desc"
            },
            select:{
              uid:true,
              transactionid:true,
              connectorid:true,
              max_kwh:true
            }
          })
          const stoptransactionid = stoptransaction.transactionid;
          const connectorid = stoptransaction.connectorid;
          const max_kwh = stoptransaction.max_kwh;
        const requestBody ={
          uid: chargerUid,
          id_tag: userid,
          connector_id: connectorid,
          transactionid:stoptransactionid,
          max_kwh:max_kwh
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
          return res.status(200).json({message:"Charger stopped successfully"})
    } catch (error) {
        console.log(error)    
        return res.status(500).json({message:"Charger stopped failed"})
    }
}

export default chargerstop
