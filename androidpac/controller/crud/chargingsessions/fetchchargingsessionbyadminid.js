import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

const fetchchargingsessionbyadminid = async(req,res)=>{
    try {
        const {adminid} = req.body;
        const findchargingsession = await prisma.charingsessions.findMany({
            where:{
                associatedadminid:adminid
            }
        })
        return res.status(200).json({message:"All of the data",data:findchargingsession})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:error})
    }
}

export default fetchchargingsessionbyadminid
