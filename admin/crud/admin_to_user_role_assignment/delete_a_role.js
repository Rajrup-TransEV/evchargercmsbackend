//delete a role for a user
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
const prisma = new PrismaClient();
const delete_a_role =  async (req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "delete_a_role.js";
        logging(messagetype, message, filelocation);
      return res.status(403).json({ message: "API route access forbidden" });
  }
    try {
        const {get_role_id} = req.body;
        if(!get_role_id){
            const messagetype = "error";
            const message = "please enter the role id";
            const filelocation = "delete_a_role.js";
            logging(messagetype, message, filelocation);
            return res.status(400).json({message:"please enter the role id"})
        }
    const delete_role = await prisma.assignRoles.delete({
        where:{
            uid:get_role_id
        }
    })
    if(!delete_role){
        const messagetype = "error";
        const message = "Role not found or deleted from the database";
        const filelocation = "delete_a_role.js";
        logging(messagetype, message, filelocation);
        return res.status(404).json({message:"Role not found or deleted from the database"})
    }
    const messagetype = "success";
    const message = "Role data associated hasbeen deleted successfully";
    const filelocation = "delete_a_role.js";
    logging(messagetype, message, filelocation);
    return res.status(200).json({message:"Role data associated hasbeen deleted successfully"})
    } catch (error) {
    console.log(error) 
    const messagetype = "error";
    const message = `an error occurred ${error}`;
    const filelocation = "delete_a_role.js";
    logging(messagetype, message, filelocation);   
    return res.status(500).json({message:error})
    }
}

export default delete_a_role