import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
const EXTERNAL_URI = process.env.EXTERNAL_URI
const OCPP_API_KEY = process.env.OCPP_API_KEY;
const ASSOCIATED_ADMIN = process.env.ASSOCIATED_ADMIN;
const chargerstop = async(req,res)=>{
    const { chargerid, userid}=req.body;
    try {
          const stoptransaction = await prisma.chargerTransaction.findFirstOrThrow({
            where:{
              AND:[
                {
                  chargerid:chargerid
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
          const findhub = await prisma.addhub.findFirstOrThrow({
            where: {
              hubchargers: { array_contains: [chargerid] },
            },
          });
          const hubtariff = findhub.hubtariff;
        const requestBody ={
          uid: chargerid,
          id_tag: userid,
          connector_id: connectorid,
          transaction_id:stoptransactionid,
          max_kwh:max_kwh
        }
        const response = await fetch(`${EXTERNAL_URI}/api/stop_transaction`, {
            method: "POST",
            headers: { "Content-Type": "application/json",
              "x-api-key":OCPP_API_KEY
             },
            body: JSON.stringify(requestBody),
          });
          const result = await response.json()
          const consumedkwhx = result.consumedkwh;
          const totalcostx = consumedkwhx* hubtariff
          if (result.status == "true"){
            return res.status(200).json({
              message:"Charger stopped successfully",
              consumedkwh:consumedkwhx
            })
          }
            else{
              return res.status(400).json({message:"Charger stopped failed"})
            }
   
    } catch (error) {
        console.log(error)    
        return res.status(500).json({message:"Charger stopped failed"})
    }
}

export default chargerstop
