//list of faqs 
//get all of the faq data
import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../../lib/customuids.js";
import emailQueue from "../../../../lib/emailqueue.js";


const prisma = new PrismaClient();

const faqlist = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "faqlist.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }
    try {
     const faqdata = await prisma.fAQ.findMany({})
     const messagetype = "success";
     const message = "All of the faqs hasbeen fetched successfully from database";
     const filelocation = "faqlist.js";
     logging(messagetype, message, filelocation);
     return res.status(200).json({message:"All of the data",data:faqdata})
    } catch (error) {
        console.log(error)
        const messagetype = "error";
        const message = `${error}`;
        const filelocation = "faqlist.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({error:error})
    }
}

export default faqlist