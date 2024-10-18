//close a message
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
const prisma = new PrismaClient();
const closeamessage = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "closemessage.js"
        logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
  const {uid}=req.body;
  try {
   const updatedata = await prisma.helpandSupport.update({
      where:{
        uid:uid
      },data:{
        messagestatus:false
      }
   })
   const messagetype = "update"
   const message = "message status hasbeen updated"
   const filelocation = "closemessage.js"
   logging(messagetype,message,filelocation)
   return res.status(200).json({message:"this message now mark as resolved"})
  } catch (error) {
    console.log(error)
    const messagetype = "error"
    const message = `${error}`
    const filelocation = "closemessage.js"
    logging(messagetype,message,filelocation)
    return res.status(500).json({error:error})
  }
}

export default closeamessage