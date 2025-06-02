//feedback by admin id
import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const feedbackbyadminid = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "feedbackbyadminid.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {associatedadminid}=req.body
    try {

        const feedbackbyadminid = await prisma.feedback.findFirstOrThrow({
            where:{
                associatedadminid:associatedadminid
            }
        })
        const messagetype = "success";
        const message = "feedback filter by admin id";
        const filelocation = "feedbackbyadminid.js";
        logging(messagetype, message, filelocation);
        return res.status(201).json({ message: "feedback by adminid",data:feedbackbyadminid });
    } catch (error) {
        console.log(error)
        const messagetype = "error";
        const message = `${error}`;
        const filelocation = "feedbackbyadminid.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({error:error})
    }
}

export default feedbackbyadminid