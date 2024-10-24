//user specific message

import { PrismaClient } from "@prisma/client";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../lib/customuids.js";
const prisma = new PrismaClient();
const userspecificmessage = async(req,res)=>{

    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "userspecificmessage.js"
        logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
  const{useremail}=req.body
  try {
    const usm = await prisma.helpandSupport.findMany({
        where:{
            email:useremail
        }
    })
    const messagetype = "success"
    const message = "All of the user specific message"
    const filelocation = "userspecificmessage.js"
    logging(messagetype,message,filelocation)
    return res.status(200).json({message:"user under all messages",data:usm})

  } catch (error) {
    console.log(error)
    const messagetype = "error"
    const message = `${error}`
    const filelocation = "userspecificmessage.js"
    logging(messagetype,message,filelocation)
    return res.status(500).json({error:error})
  }

}

export default userspecificmessage