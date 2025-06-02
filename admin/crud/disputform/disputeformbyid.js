//get dispute form details by id
import { PrismaClient } from "@prisma/client";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const disputeform  = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "disputeformbyid.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {id}=req.body;
    try {
        const finder = await prisma.disputFrom.findFirstOrThrow({
            where:{
                id:id
            }
        })
        const messagetype = "success"
        const message = "Charger getform by id"
        const filelocation = "getformbyadminid.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({
            message:"Data",
            data:finder
        })
    
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `${error}`
        const filelocation = "getformbyadminid.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({error:error})
    }
}

export default disputeform