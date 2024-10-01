//deleta user profile data 
import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const delete_user_profile = async (req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "delete_user_profile.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {userid} = req.body ;

    try {
        if(uid===""){
            const messagetype = "error"
            const message = "uid is required field"
            const filelocation = "delete_user_profile.js"
            logging(messagetype,message,filelocation)
            return res.status(400).json({message:"uid is required field"})
        }
        const deletedata = await prisma.user.delete({
            where:{
                uid:userid
            }
        })
        if(!deletedata){
            const messagetype = "error"
            const message = "404 no data hasbeen found"
            const filelocation = "delete_user_profile.js"
            logging(messagetype,message,filelocation)
                return res.status(404).json({message:"404 no data hasbeen found"})
        }
        const messagetype = "success"
        const message = "your data hasbeen deleted successfully"
        const filelocation = "delete_user_profile.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:"your data hasbeen deleted successfully"})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `Internal server error occurred  -= ${error}`
        const filelocation = "delete_user_profile.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:"error occurred",data:error})
    }
}

export default delete_user_profile