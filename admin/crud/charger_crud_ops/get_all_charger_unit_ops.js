//list the all charges 

import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();


const get_all_charger= async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "get_all_charger_unit_ops.js"
        logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
    try {
        // try {
        // const chargercount =  await prisma.charger_Unit.count();
        // const chargeranals = await prisma.analytics.create({
        //     data:{
        //         uid:crypto.randomUUID(),
        //         countofchargerunits:chargercount.toString()
        //     }
        // })
        // const messagetype = "success"
        // const message = `Count of chargers ${chargercount}`
        // const filelocation = "get_all_charger_unit_ops.js"
        // logging(messagetype,message,filelocation)
        // } catch (error) {
        //         console.log(error)   
        //         const messagetype = "error"
        //         const message =`${error}`
        //         const filelocation = "get_all_charger_unit_ops.js"
        //         logging(messagetype,message,filelocation) 
        // }
        
        const get_all_charger_assigned=await prisma.charger_Unit.findMany()
        if(!get_all_charger_assigned){
            const messagetype = "error"
            const message = "something went worng please try again soon"
            const filelocation = "get_all_charger_unit_ops.js"
            logging(messagetype,message,filelocation)
            return res.status(503).json("something went worng please try again soon")
        }
        const messagetype = "success"
        const message = "List of charger data is coming"
        const filelocation = "get_all_charger_unit_ops.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:"List of charger data is coming" ,data:get_all_charger_assigned})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message =`${JSON.parse(error)}`
        const filelocation = "get_all_charger_unit_ops.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json(error)
    }
    
    }
    
    export default get_all_charger