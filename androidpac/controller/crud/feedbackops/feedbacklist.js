//list of feedbacks
import logging from "../../../../logging/logging_generate.js";

import { PrismaClient } from '@prisma/client'; // Assuming you're using Prisma for database interaction
const prisma = new PrismaClient();

const listoffeedbacks = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "feedbacklist.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    try {
         const listoffeedback = await prisma.feedback.findMany({})
         const messagetype = "successful";
         const message = "list of feedback hasbeen fetched";
         const filelocation = "feedbacklist.js";
         logging(messagetype, message, filelocation);
         return res.status(200).json({data:listoffeedback,message:"list of fetched data"})
    } catch (error) {
        console.log(error)
        const messagetype = "error";
        const message = `${error}`;
        const filelocation = "feedbacklist.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({error:error})
    }
}

export default listoffeedbacks 