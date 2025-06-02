//dispute form list
import { PrismaClient } from "@prisma/client";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../lib/customuids.js";

const prisma = new PrismaClient()

const disputeformlist = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "disputeformlist.js"
        logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
  try {
    const list = await prisma.disputFrom.findMany({})
    const messagetype = "success"
    const message = "list of all data"
    const filelocation = "disputeformshow.js"
    logging(messagetype,message,filelocation)
    return res.status(200).json({message:"All the data",data:list})
  } catch (error) {
    console.log(error)
    const messagetype = "error"
    const message = `${error}`
    const filelocation = "disputeformlist.js"
    logging(messagetype,message,filelocation)
    return res.status(500).json({error:error})
  }
}

export default disputeformlist