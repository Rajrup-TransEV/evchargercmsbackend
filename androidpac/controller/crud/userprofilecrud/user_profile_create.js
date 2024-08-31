//andorid app user profile create 
import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const userprofilecreate = async (req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "androidpac/user_profile_create.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {firstname,lastname,bio,address,phonenumber,userid}=req.body
    try {
        if(firstname===""||!lastname===""||bio===""||address===""||phonenumber===""||userid===""){
            const messagetype = "error"
            const message = "required fields cannot be empty"
            const filelocation = "androidpac/user_profile_create.js"
            logging(messagetype,message,filelocation)
            return res.status(403).json({ message: "required fields cannot be empty" });
        }
    const userprofilecreate = await prisma.appUserProfile.create({
        data:{
            uid:crypto.randomUUID(),
        firstname:firstname,
        lastname:lastname,
        bio:bio,
        address:address,
        phonenumber:phonenumber,
        userId:userid
        }
    })
    if(!userprofilecreate){
        const messagetype = "error"
        const message = "Something went wrong please try again"
        const filelocation = "androidpac/user_profile_create.js"
        logging(messagetype,message,filelocation)
        return res.status(400).json({message:"Something went wrong please try again"})
    }
    const messagetype = "success"
    const message = "Userprofile hasbeen created successfully"
    const filelocation = "androidpac/user_profile_create.js"
    logging(messagetype,message,filelocation)
    return res.status(200).json({message:"Userprofile hasbeen created successfully"})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `Internal server error occurred - ${error}`
        const filelocation = "androidpac/user_profile_create.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:`Error ${error}`})
    }
}

export default userprofilecreate