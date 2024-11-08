//feedback details by its id
import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const feedbackdetailbyid = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "feedbackdetailbyid.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {uid}=req.body
    try {
        const fbd = await prisma.feedback.findUnique({
            where:{
                uid:uid
            }
        })   
        const messagetype = "success";
        const message = "feedback details by id hasbeen fetched";
        const filelocation = "feedbackdetailbyid.js";
        logging(messagetype, message, filelocation);
        return res.status(200).json({data:fbd})
    } catch (error) {
        console.log(error)
        const messagetype = "error";
        const message = `${error}`;
        const filelocation = "feedbackdetailbyid.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({error:error})
    }

}

export default feedbackdetailbyid