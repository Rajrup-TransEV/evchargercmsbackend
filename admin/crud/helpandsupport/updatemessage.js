//update message
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();
const updatemessage=async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "updatemessage.js"
        logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
    const {uid}=req.body;
    try {
    const searchmessage = await  prisma.helpandSupport.findFirstOrThrow({
        where:{
            id:uid
        }
    })    
    const updatedata={}
    const {
        name,
        email,
        phonenumber,
        message,
        adminuid
    } =req.body;
    if(name){
        updatedata.name=name;
        const messagetype = "update"
        const message = `name: ${name}`
        const filelocation = "updatemessage.js"
        logging(messagetype,message,filelocation)
    }
    if(email){
        updatedata.email=email
        const messagetype = "update"
        const message = `email: ${email}`
        const filelocation = "updatemessage.js"
        logging(messagetype,message,filelocation)
    }
    if(phonenumber){
        updatedata.phonenumber=phonenumber
        const messagetype = "update"
        const message = `phonenumber: ${phonenumber}`
        const filelocation = "updatemessage.js"
        logging(messagetype,message,filelocation)
    }
    if(message){
        updatedata.message=message
        const messagetype = "update"
        const message = `message: ${message}`
        const filelocation = "updatemessage.js"
        logging(messagetype,message,filelocation)
    }
    if(adminuid){
        updatedata.adminuid=adminuid;
        const messagetype = "update"
        const message = `adminuid: ${adminuid}`
        const filelocation = "updatemessage.js"
        logging(messagetype,message,filelocation)
    }
    const updatehelp = await prisma.helpandSupport.update({
        where:{
            id:uid
        },
        data:updatedata
    })
    return res.status(200).json(updatehelp)
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `error ${error}`
        const filelocation = "updatemessage.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({error:error})
    }
}

export default updatemessage