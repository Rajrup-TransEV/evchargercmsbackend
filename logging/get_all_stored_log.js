//get all logs from database
import { PrismaClient } from "@prisma/client";
import { getCache, setCache } from "../utils/cacheops.js";
import logging from "./logging_generate.js";

const prisma = new PrismaClient();

const get_all_logs = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      const messagetype = "error";
      const message = "API route access error";
      const filelocation = "get_all_stored_log.js";
      logging(messagetype, message, filelocation);
      return res.status(403).json({ message: "API route access forbidden" });
  }
    try {
        //try to fetch from the cache db first
        const getcacheddata = await getCache("allcachedlogs")
        if(getcacheddata){
            const messagetype = "success";
            const message = "Data retrieved from cache";
            const filelocation = "get_all_of_the_role.js";
            logging(messagetype, message, filelocation);
            return res.status(200).json({ message: "All of the listed roles", data: getcacheddata });
        }
        const alllogdata = await prisma.logRetention.findMany()
        await setCache("allcachedlogs",alllogdata,520)
        const messagetype = "success";
        const message = "All of the logs data";
        const filelocation = "get_all_of_the_role.js";
        logging(messagetype, message, filelocation);
        return res.status(200).json({message:"all of the requested data",data:alllogdata})
    } catch (error) {
        console.log(error)
        const messagetype = "error";
        const message = `Error occurred ${error}`;
        const filelocation = "get_all_of_the_role.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({message:`Error occurred ${error}`})
    }
}

export default get_all_logs