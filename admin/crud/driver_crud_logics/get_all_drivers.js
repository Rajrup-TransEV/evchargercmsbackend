//see how list of drivers available in database
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import { getCache, setCache } from "../../../utils/cacheops.js";
const prisma = new PrismaClient();
const getalldrivers = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "get_all_drivers.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    try {
        //get data from cache first 
        const cacheddata = await getCache("all_driver_data")
        if(cacheddata){
            const messagetype = "success";
            const message = "All vehicle owerner data hasbeen retrive";
            const filelocation = "get_all_drivers.js";
            logging(messagetype, message, filelocation);
            return res.status(200).json({ message: "All vehicle owerner data hasbeen retrive", data: cacheddata });
        }
        const getdatafromdb = await prisma.assigntovehicleowener.findMany()
        if (!getdatafromdb){
            const messagetype = "error"
            const message = "the is no data associated with this vehicle owener"
            const filelocation = "get_all_drivers.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json({message:`the is no data associated with this vehicle owener`})
        }
        await setCache("all_driver_data",getdatafromdb,3600)
        const messagetype = "success"
        const message = "All vehicle owerner data hasbeen retrive"
        const filelocation = "get_all_drivers.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:message,data: getdatafromdb})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `${error}`
        const filelocation = "get_all_drivers.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:`${error}`})
    }
}
export default getalldrivers