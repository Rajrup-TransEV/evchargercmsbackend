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
    const {uid} = req.body ;

    try {
        if(uid===""){
            return res.status(400).json({message:"uid is required field"})
        }
        const deletedata = await prisma.appUserProfile.delete({
            where:{
                uid:uid
            }
        })
        if(!deletedata){
                return res.status(404).json({message:"404 no data hasbeen found"})
        }
        return res.status(200).json({message:"your data hasbeen deleted successfully"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"error occurred",data:error})
    }
}

export default delete_user_profile