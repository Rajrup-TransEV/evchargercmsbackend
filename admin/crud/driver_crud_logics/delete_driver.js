// delete a driver from database
import logging from "../../../logging/logging_generate.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const deletevehicleowener = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "delete_driver.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
 
    const {uid,vehicleoweneremail} =  req.body;

    try {
        const deletedata = await prisma.assigntovehicleowener.findUniqueOrThrow({
            where:{
                vehicleoweneremail:vehicleoweneremail,
            },select:{
                uid:true,
                vehicleoweneremail:true
            }
        })
        const deletedriver  = await prisma.assigntovehicleowener.delete({
            where:{
                vehicleoweneremail:deletedata.vehicleoweneremail
            }
        })
        if(!deletedriver){
            const messagetype = "error"
            const message = "Bad request the user is not presentr"
            const filelocation = "delete_driver.js"
            logging(messagetype,message,filelocation)
                return res.status(400).json({message:"Bad request the user is not present"})
        }
        const messagetype = "success"
        const message = "user hasbeen deleted succesfully"
        const filelocation = "delete_driver.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:"user hasbeen deleted succesfully"})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `delete vehicle user error ${error}`
        const filelocation = "delete_driver.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:error})
    }
   
}

export default deletevehicleowener