//list the all charges 

import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import { getCache, setCache } from "../../../utils/cacheops.js";
import fs from 'fs';
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
        const cacheddata = await getCache("all_charger_units");
        if(cacheddata){
            const messagetype = "success";
            const message = "Data retrieved from cache";
            const filelocation = "get_all_charger_unit_ops.js";
            logging(messagetype, message, filelocation);
            return res.status(200).json({ message: "List of charger data is coming", data: cacheddata });
        }
        const get_all_charger_assigned=await prisma.charger_Unit.findMany()
        console.log("all chargers",get_all_charger_assigned)
        if(!get_all_charger_assigned){
            const messagetype = "error"
            const message = "something went worng please try again soon"
            const filelocation = "get_all_charger_unit_ops.js"
            logging(messagetype,message,filelocation)
            return res.status(503).json("something went worng please try again soon")
        }
        await setCache("all_charger_units", get_all_charger_assigned, 3600); // Cache for 1 hour
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