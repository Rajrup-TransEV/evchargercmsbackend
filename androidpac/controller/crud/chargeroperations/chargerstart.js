import { PrismaClient } from "@prisma/client";
import generateCustomRandomUID from "../../../../lib/customuids.js";
import logging from "../../../../logging/logging_generate.js";

const prisma = new PrismaClient();
const chargerstarttransactions = async(req,res)=>{

    const {chargerid}=req.body
    try {
        const findcharger = await prisma.charger_Unit.findFirstOrThrow({
            where:{
                uid:chargerid
            },select:{
                uid:true,
                Chargerserialnum:true,
                userId:true
            }
        })
        if(!findcharger||findcharger==null){
            return res.status(404).json({message:"no charger found with this id"})
        }
        const userid= findcharger.userId;
        const walletdetails = await prisma.wallet.findFirstOrThrow({
            where:{
                OR:[
                    {appuserrelatedwallet:userid},
                    {userprofilerelatedwallet:userid}
                ]
            },select:{
                balance:true,
                uid:true
            }
        })
        if (walletdetails.balance<=300){
            return res.status(400).json({message:"Wallet balance is not sufficiant please recharge"})
        }
        const chargerdetails = {
            "uid":findcharger.uid,
            "connector_id":"1",
            "type":"Operative"

            
        }
        const chargerstart = await fetch("http://srv586896.hstgr.cloud:80/api/change_availability",{
            method:"POST",
            headers: { 
                'Content-Type': 'application/json' 
            },
            body:JSON.stringify(chargerdetails)
        })
        const response = await chargerstart.json()
        console.log(response)
        const messagetype = "unknown";
        const re = JSON.stringify(response)
        const message = `${re}`;
        logging(messagetype, message, "chargerbookings.js");
        if(response.status=="Accepted"){
            return res.status(200).json({message:"Charging disengagged"})
        }else{
            return res.status(400).json({message:"Unknown error please check logs for more details"})
        }
    } catch (error) {
        return res.status(500).json({error:error})
    }
   
}

export default chargerstarttransactions