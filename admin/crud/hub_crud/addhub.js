// add hub
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../lib/customuids.js";

const prisma = new PrismaClient();
const addhub =  async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "addhub.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const {hubname,hubchargers,hubtariff,hublocation,adminid}=req.body
    try {
 
        const createhub = await prisma.addhub.create({
            data:{
                uid:generateCustomRandomUID(),
                hubname:hubname,
                hubchargers:hubchargers,
                hubtariff:hubtariff,
                hublocation:hublocation,
                adminid:adminid
            }
        })
        const messagetype = "success";
        const message = "hub add details added";
        const filelocation = "addhub.js";
        logging(messagetype, message, filelocation);
      
       return res.status(201).json({message:"data hasbeen created"})
    } catch (error) {
        console.log(error)
        const messagetype = "error";
        const message = `${error}`;
        const filelocation = "addhub.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({error:error})
    }


}

export default addhub