
import { PrismaClient } from "@prisma/client";
import generateRandomUID from "../../../lib/generaterandomuid.js";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";
const prisma = new PrismaClient();
const createmessage = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "createmessage.js"
        logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
    
    const {name,email,phonenumber,usermessage} =req.body;
    try {
           const cm = await prisma.helpandSupport.create({
            data:{
                uid:generateRandomUID(),
                name:name,
                email:email,
                phonenumber:phonenumber,
                message:usermessage,
                adminuid:'yyyy',
            }
           })   
        const to = "transmogrify17@outlook.com" 
        const subject = "help and support"
        const text = `User email - ${email}  need help .Their message is - ${usermessage}`
        console.log('Adding email job to queue:', { to, subject, text });
        await emailQueue.add({ to, subject, text }, {
            attempts: 5, // Number of retry attempts
            backoff: 10000 // Wait 10 seconds before retrying
        });
        const messagetype = "success"
        const message = "message copied successfully"
        const filelocation = "createmessage.js"
        logging(messagetype,message,filelocation)
        return res.status(201).json({message:"Your message hasbeen send successfully we will contact you shortly"})

    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `${error}`
        const filelocation = "createmessage.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({error:error})
    }

}

export default createmessage