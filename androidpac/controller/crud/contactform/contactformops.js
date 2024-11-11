//contact form data create and save into db for super admin or admin to check
import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../../lib/customuids.js";
import emailQueue from "../../../../lib/emailqueue.js";


const prisma = new PrismaClient();
const contactform = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "contactformops.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {firstname,lastname,email,usermessage}=req.body
    try {
        const contactformsave =  await prisma.contactform.create({
            data:{
                uid:generateCustomRandomUID(),
                firstname:firstname,
                lastname:lastname,
                email:email,
                message:usermessage
            }
        })   
        const messagetype = "success";
        const message = "successfully data hasbeen created";
        const filelocation = "contactformops.js";
        logging(messagetype, message, filelocation);
        return res.status(200).json({message:"Thank you for contacting"}) 
    } catch (error) {
        console.log(error)
        const messagetype = "error";
        const message = `${error.message || error}`;
        logging(messagetype, message, "contactformops.js")
        return res.status(500).json({ error: error.message || error });
    }

}

export default contactform