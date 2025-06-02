//logging details
import { PrismaClient } from "@prisma/client";
import logging from "./logging_generate.js";


const prisma = new PrismaClient();
const loggingdetails = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "loggingdetails.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {id}=req.body;

    try {
        const find = await prisma.logRetention.findFirstOrThrow({
            where:{
                id:id
            }
        })
        const messagetype = "success";
        const message = "Logging details fetched successfully";
        const filelocation = "loggingdetails.js";
        logging(messagetype, message, filelocation)

        return res.status(200).json({
            message:"Logging details",
            data:find
        })
    } catch (error) {
        console.log(error)
        const messagetype = "error";
        const message = `${error}`;
        const filelocation = "loggingdetails.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({
            message:"Error details",
            error:error
        })
    }
}
export default loggingdetails