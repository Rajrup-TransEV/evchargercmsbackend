import { PrismaClient } from "@prisma/client";
import generateCustomRandomUID from "../../../../lib/customuids.js";
import logging from "../../../../logging/logging_generate.js";

const prisma = new PrismaClient();
const chargerstarttransactions = async(req,res)=>{

    const {chargerid,userid,state}=req.body
    try {
        const findcharger = await prisma.charger_Unit.findFirstOrThrow({
            where:{
                uid:chargerid
            }
        })
        if(findcharger==null){
            return res.status(404).json({message:"no charger found with this id"})
        }
        
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
            return res.status(403).json({message:"Wallet balance is not sufficiant please recharge"})
        }
        const chargerdetails = {
            "charger_id":chargerid,
            "id_tag":userid
            
        }
        const chargerstart = await fetch("http://srv586896.hstgr.cloud:80/api/start_transaction",{
            method:"POST",
            headers: { 
                'Content-Type': 'application/json' 
            },
            body:JSON.stringify(chargerdetails)
        })
        const response = chargerstart.json()
        if(response){
            return res.status(200).json({message:"Charging session started"})
        }
    } catch (error) {
        return res.status(500).json({error:error})
    }
   
}

export default chargerstarttransactions