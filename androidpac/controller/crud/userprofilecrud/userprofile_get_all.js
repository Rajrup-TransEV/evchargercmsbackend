// user profile get all data
import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";

const prisma = new PrismaClient();
const getalluserprofile = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "androidpac/user_profile_get_all.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    try {
        const getalldata = await prisma.appUserProfile.findMany({
            select:{
                uid:true,
                firstname:true,
                lastname:true,
                bio:true,
                address:true,
                phonenumber:true,
                user:true
            }
        })
        if(!getalldata){
            return res.status(404).json({message:"Data not found"})
        }
        return res.status(200).json({message:"All of the data",userprofile:getalldata})
    } catch (error) {
        return res.status(500).json({message:"Error occurred",data:error})
    }
   
}

export default getalluserprofile