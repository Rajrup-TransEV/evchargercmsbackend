//feedbacl create 
import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../../lib/customuids.js";
import emailQueue from "../../../../lib/emailqueue.js";

const prisma = new PrismaClient();

const feedbackcreate = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "feedbackcreate.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const {username,email,ratingnumber,feedbackmessage,feedbacktype}=req.body;
    try {
       const feedbackcreate=await prisma.feedback.create({
        data:{
            uid:generateCustomRandomUID(),
            username:username,
            email:email,
            ratingnumber:ratingnumber,
            feedbackmessage:feedbackmessage,
            feedbacktype:feedbacktype,
            associatedadminid:'yyyy',
            isserveytook:true
        }
       })

       const messagetype = "success";
       const message = "Feedback collected";
       logging(messagetype,message,'feedbackcreate.js')

       const subject = "Feedback Survey"
       const to = "transmogrify17@outlook.com"
       const text = `
        Feedback survey id - ${feedbackcreate.uid} 
        ${username}'s Feedback related application is, -

        User's email - ${feedbackcreate.email}
        Feedback type - ${feedbackcreate.feedbacktype}
        ratingnumber - ${feedbackcreate.ratingnumber}
        feedbackmessage -  ${feedbackcreate.feedbackmessage}
       `
       await emailQueue.add({ to, subject, text }, {
        attempts: 5,
        backoff: 10000
    });

    return res.status(201).json({message:"Done thank you for perticipated in feedbacksurvey. if required we'll contact you"})
    } catch (error) {
        console.log(error)
        const messagetype = "error";
        const message = `${error.message || error}`;
        logging(messagetype, message, "feedbackcreate.js");
        console.error(error);
        return res.status(500).json({ error: error.message || error });
    }
}

export default feedbackcreate