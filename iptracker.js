import { PrismaClient } from '@prisma/client';
import generateCustomRandomUID from './lib/customuids.js';
import logging from './logging/logging_generate.js';


const prisma = new PrismaClient();

const ipTracker = async (req, res) => {
  const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "iptracker.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const {ip,datetime,path}=req.body;
    console.log(ip)
    console.log(datetime)
    if(ip){
      try {
        const createdata = await prisma.iptracker.create({
            data:{
              uid:generateCustomRandomUID(),
              ipaddress:ip,
              filepath:path,
              datetimeofaccess:datetime,
              messages:"Ip is accessed of the user"
            }
        })
        const messagetype = "success"
        const message = "Ip data saved successfully"
        const filelocation = "iptracker.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:"Ip data saved"})
      } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `${error}`
        const filelocation = "iptracker.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:"Error occurred"})
      }
    }else{
      const messagetype = "error"
      const message = "Ip cannot save because user was using ip blocker"
      const filelocation = "iptracker.js"
      logging(messagetype,message,filelocation)
    }

};

export default ipTracker;
