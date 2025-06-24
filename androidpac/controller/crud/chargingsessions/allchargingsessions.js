import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();


const allchargingsessios = async(req,res)=>{
    try {
        const allchargingsessions = await prisma.charingsessions.findMany({})
        console.log(allchargingsessions)
        return res.status(200).json({message:"All of the data",data:allchargingsessions})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:error})
    }

}

export default allchargingsessios;
