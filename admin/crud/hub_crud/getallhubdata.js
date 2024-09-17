//get all hub details
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import { getCache, setCache } from "../../../utils/cacheops.js";
const prisma = new PrismaClient();

const GetAllHubdata =  async(req,res)=>{
    
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "getallhubdata.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }
    try {
        console.log("get all hub data try is running")
        const cachedata = await getCache("allhubdata")
        if(cachedata){
            const messagetype = "success";
            const message = "All hub details hasbeen fetched successfully from cache";
            const filelocation = "getallhubdata.js";
            logging(messagetype, message, filelocation);
            return res.status(200).json({message:"All of the available data",data:cachedata})
        }
        const alldata = await prisma.addhub.findMany()
        console.log(alldata)
       await setCache("allhubdata",alldata,3600)

        return res.status(200).json({message:"All of the available data",data:alldata})
        
    } catch (error) {
     console.log(error)   
     const messagetype = "error";
     const message = `${error}`;
     const filelocation = "getallhubdata.js";
     logging(messagetype, message, filelocation);
     return res.status(500).json({error:error})
    }
}

export default GetAllHubdata