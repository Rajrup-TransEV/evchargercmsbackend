//main role create || list of role create
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
const prisma = new PrismaClient();

const createlistofroles = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
  // Check if the API key is valid
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    const messagetype = "error"
    const message = "API route access error"
    const filelocation = "role_create_main.js"
    logging(messagetype,message,filelocation)
    return res.status(403).json({ message: "API route access forbidden" });
}
    try {
        const {rolename,roledesc}=req.body;
        if(!rolename || !roledesc){
            return res.status(400).json({message:"role name and role desc cannot be empty."});
        }
        const createroles  = await prisma.assignRoles.create({
            data:{
                uid:crypto.randomUUID(),
                rolename:rolename,
                roledesc:roledesc
            }
        })
        if(!createroles){
            const messagetype = "error"
            const message = "Something went wrong while creating the role please try again soon"
            const filelocation = "role_create_main.js"
            logging(messagetype,message,filelocation)
            return res.status(400).json("Something went wrong while creating the role please try again soon")
        }
        const messagetype = "success"
        const message = "role hasbeen created successfully"
        const filelocation = "role_create_main.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:"role hasbeen created successfully"})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `Data creation has some issues :: ${error}`
        const filelocation = "role_create_main.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:error})
    }
  
}
export default createlistofroles