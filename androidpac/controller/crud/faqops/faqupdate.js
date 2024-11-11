//faqupdate
import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../../lib/customuids.js";
import emailQueue from "../../../../lib/emailqueue.js";


const prisma = new PrismaClient();
const faqupdate = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "faqupdate.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {uid,faqquestion,faqdescription}=req.body
    try {
        //find the faqform first
        const findfaqid = await prisma.fAQ.findUnique({
            where:{
                uid:uid
            }
        })
        const updateData={}
        if(faqquestion) updateData.faqquestion=faqquestion;
        if(faqdescription) updateData.faqdescription=faqdescription;

        const updatefaqdata= await prisma.fAQ.update({
            where:{uid:uid},
            data:updateData
        })

        const messagetype = "update";
        const message = "Updated faq data";
        const filelocation = "faqupdate.js";
        logging(messagetype, message, filelocation);

        return res.status(200).json({message:"updated faq data",data:updatefaqdata})
    } catch (error) {
        console.log(error)
        
        const messagetype = "error";
        const message = `${error}`;
        const filelocation = "faqupdate.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({error:error})
    }
}

export default faqupdate