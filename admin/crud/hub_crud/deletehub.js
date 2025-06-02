// delete a hub data from data base using their uid
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const delete_hub_data = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "deletehub.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const {uid}=req.body;
    console.log(uid)
try {
    const deletedata = await prisma.addhub.delete({
        where:{
            uid:uid
        }
    })
    const messagetype = "success"
    const message = "user hasbeen deleted succesfully"
    const filelocation = "deletehub.js"
    logging(messagetype,message,filelocation)
    return res.status(200).json({message:"Selected hubdata hasbeen delete successfully"})
} catch (error) {
    console.log(error)
    const messagetype = "error"
    const message = `${error}`
    const filelocation = "deletehub.js"
    logging(messagetype,message,filelocation)
    return res.status(500).json({message:error})
}
 
}


export default delete_hub_data