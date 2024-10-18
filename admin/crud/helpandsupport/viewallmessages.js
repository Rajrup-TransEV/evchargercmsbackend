//see all messages
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
const prisma = new PrismaClient();
const viewallmessages = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "viewallmessages.js"
        logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
  try {
    const alldata = await prisma.helpandSupport.findMany()
    const messagetype = "success"
    const message = "all help and support messages hasbeen fetched"
    const filelocation = "viewallmessages.js"
    logging(messagetype,message,filelocation)

    return res.status(200).json({message:"all of the requested data",data:alldata})
  } catch (error) {
    console.log(error)
    const messagetype = "error"
    const message = `${error}`
    const filelocation = "viewallmessages.js"
    logging(messagetype,message,filelocation)
    return res.status(500).json({error:error})
  }
}

export default viewallmessages