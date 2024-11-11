//delete a contact message
import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../../lib/customuids.js";
import emailQueue from "../../../../lib/emailqueue.js";


const prisma = new PrismaClient();
const contactmessagedelete = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "contactmessagedelete.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {uid}=req.body

    try {
        const deletecontact = await prisma.contactform.delete({
            where:{
                uid:uid
            }
        }
    )
    const messagetype = "success";
    const message = "successfully data hasbeen deleted";
    const filelocation = "contactmessagedelete.js";
    logging(messagetype, message, filelocation);
    return res.status(200).json({messsage:"successfully data hasbeen deleted"})
    } catch (error) {
        console.log(error)
        const messagetype = "error";
        const message = `${error.message || error}`;
        logging(messagetype, message, "contactmessagedelete.js")
        return res.status(500).json({ error: error.message || error });
    }
}

export default contactmessagedelete