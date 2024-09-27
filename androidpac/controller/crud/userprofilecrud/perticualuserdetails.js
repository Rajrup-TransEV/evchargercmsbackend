//get perticular user profile details
import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../../lib/customuids.js";

const prisma = new PrismaClient();


const pprofiledetails = async (req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "androidpac/perticularuserdetails.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
        const {userid}=req.body
        try {
            const find =await prisma.appUserProfile.findFirst({
                where:{
                    userId:userid
                }
            })    
            const messagetype = "success"
            const message = "Profile details hasbeen fetched successfully"
            const filelocation = "androidpac/perticularuserdetails.js"
            logging(messagetype,message,filelocation)
            return res.status(200).json({message:"profile details hasbeen fetch successfully",data:find})     
        } catch (error) {
            console.log(error)
            const messagetype = "error"
            const message = `${error}`
            const filelocation = "androidpac/perticularuserdetails.js"
            logging(messagetype,message,filelocation)
            return res.status(500).json({message:"error occurred",error:error})
        }
}

export default pprofiledetails