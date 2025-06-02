import { PrismaClient } from "@prisma/client";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

//get the dispute form by id
const getformbyadminid = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "getformbyadminid.js"
        logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
  const {adminid} = req.body;
  try {
    const findbyadmin = await prisma.disputFrom.findMany({
        where:{
            associatedadminid:adminid
        }
    })
    const messagetype = "success"
    const message = "Charger getform by adminid"
    const filelocation = "getformbyadminid.js"
    logging(messagetype,message,filelocation)
    return res.status(200).json({message:"get the data",data:findbyadmin})
  } catch (error) {
    console.log(error)
    const messagetype = "error"
    const message = `${error}`
    const filelocation = "getformbyadminid.js"
    logging(messagetype,message,filelocation)
    return res.status(500).json({error:error})
  }
}
export default getformbyadminid