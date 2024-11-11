//get contact form by id 
import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../../lib/customuids.js";
import emailQueue from "../../../../lib/emailqueue.js";

const prisma = new PrismaClient();

const contactmessagebyid = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "getcfbyid.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {uid}=req.body
    try {
        const getid = await prisma.contactform.findUniqueOrThrow({
            where:{
                uid:uid
            }
        })
        const messagetype = "success";
        const message = "successfully data hasbeen";
        const filelocation = "getcfbyid.js";
        logging(messagetype, message, filelocation);   
        return res.status(200).json({message:"list of contact form",data:getid})

    } catch (error) {
        console.log(error)
        const messagetype = "error";
        const message = `${error.message || error}`;
        logging(messagetype, message, "getcfbyid.js")
        return res.status(500).json({ error: error.message || error });
    }
}

export default contactmessagebyid