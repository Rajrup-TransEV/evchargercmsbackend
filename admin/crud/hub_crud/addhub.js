// add hub
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import { getCache, setCache } from "../../../utils/cacheops.js";
import generateCustomRandomUID from "../../../lib/customuids.js";

const prisma = new PrismaClient();
const addhub =  async(req,res)=>{
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
      
       return res.status(201).json({message:"data hasbeen created"})
    } catch (error) {
        console.log(error)
    }


}

export default addhub