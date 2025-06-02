//details of a messgge

import { PrismaClient } from "@prisma/client";

import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();
const details = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "detailsofamessage.js"
        logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
    const {uid} = req.body;
    try {
        const dm = await prisma.helpandSupport.findFirstOrThrow({
            where:{
                uid:uid
            }
        })
        const messagetype = "success"
        const message = "requested data hasbeen fetced successfully"
        const filelocation = "detailsofamessage.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:"requested data hasbeen fetched",data:dm})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "detailsofamessage.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({error:error})
    }
}

export default details