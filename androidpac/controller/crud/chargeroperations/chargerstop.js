import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";

const prisma = new PrismaClient();
const chargerstop = async(req,res)=>{
    const {userid,chargerid}=req.body;
    try {
        
    } catch (error) {
        console.log(error)    
    }
}