//faqops create 
import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../../lib/customuids.js";
import emailQueue from "../../../../lib/emailqueue.js";
import dotenv from "dotenv"
dotenv.config()

const prisma = new PrismaClient();  
const ASSOCIATED_ADMINID=process.env.ASSOCIATED_ADMIN

const faqopscreate  = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "faqops.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {faqquestion,faqdescription}=req.body
    try {
        const datacreate  =  await prisma.fAQ.create({
            data:{
                uid:generateCustomRandomUID(),
                faqquestion:faqquestion,
                faqdescription:faqdescription,
                associatedadminid:ASSOCIATED_ADMINID
            }
        })     
        const messagetype = "success";
        const message = "successfully data hasbeen";
        const filelocation = "faqops.js";
        logging(messagetype, message, filelocation);
        return res.status(200).json({message:"faq hasbeen created successfully"})

    } catch (error) {
        console.log(error)
        const messagetype = "error";
        const message = `${error.message || error}`;
        logging(messagetype, message, "faqops.js");
        console.error(error);
        return res.status(500).json({ error: error.message || error });
    }


}

export default faqopscreate