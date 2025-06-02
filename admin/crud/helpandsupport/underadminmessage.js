//mesages under a specific admin

import { PrismaClient } from "@prisma/client";

import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();
const underadmin = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "underadminmessage.js"
        logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
  const {adminid}=req.body
  try {
    const fc = await prisma.helpandSupport.findMany({
        where:{
            adminuid:adminid
        }
    })
    const messagetype = "success"
    const message = "successfully fetched data under a admin"
    const filelocation = "underadminmessage.js"
    logging(messagetype,message,filelocation)
    return res.status(200).json({message:"data fetched for a specific admin",data:fc})
  } catch (error) {
    console.log(error)
    const messagetype = "error"
    const message = `${error}`
    const filelocation = "underadminmessage.js"
    logging(messagetype,message,filelocation)
    return res.status(500).json({error:error})
  }
}
export default underadmin