//Get a signle user details by the role id or user id both are optional
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
const prisma = new PrismaClient();

const get_user_by_role = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
  // Check if the API key is valid
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    const messagetype = "error";
    const message = "API route access error";
    const filelocation = "get_user_details_by_role.js";
    logging(messagetype, message, filelocation);
    return res.status(403).json({ message: "API route access forbidden" });
}
    try {
        const {get_the_unique_id} = req.body;
    const get_the_user_data =  await prisma.userProfile.findFirstOrThrow({
        where:{
            uid:get_the_unique_id
        }
    })
    if (!get_the_user_data){
        const messagetype = "error";
        const message = "User data is not available for the id you've provided";
        const filelocation = "get_user_details_by_role.js";
        logging(messagetype, message, filelocation);
        return res.status(400).json("User data is not available for the id you've provided")
    }
    const get_role_data = await prisma.assignRoles.findFirstOrThrow({
        where:{
            OR: [
                { uid: get_the_unique_id },
                { userid: get_the_unique_id }
            ],
        }
    })
    if (!get_role_data){
        const messagetype = "error";
        const message = "User data is not available for the id you've provided";
        const filelocation = "get_user_details_by_role.js";
        logging(messagetype, message, filelocation);
        return res.status(400).json("No role is availabe associated with user")
    }
    const messagetype = "success";
    const message = "user data associated with role data";
    const filelocation = "get_user_details_by_role.js";
    logging(messagetype, message, filelocation);
    return res.status(200).json({message:"user data associated with role data",userdata:get_the_user_data,roledata:get_role_data})
    } catch (error) {
     console.log(error)   
     const messagetype = "error";
     const message = `message error - ${error}`;
     const filelocation = "get_user_details_by_role.js";
     logging(messagetype, message, filelocation);
     return res.status(500).json({message:`message error - ${error}`})
    }
    
}

export default get_user_by_role