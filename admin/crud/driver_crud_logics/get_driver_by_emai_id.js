//retrive vehicle owener data by their email address
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import { getCache, setCache } from "../../../utils/cacheops.js";

const prisma = new PrismaClient();

const retrive_vehicle_owener_data_by_email = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "get_driver_by_email.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {get_vehicleoweneremail,uid} = req.body;
    try {
        if(get_vehicleoweneremail===""||uid===""){
            const messagetype = "error"
            const message = "No values hasbeen provided"
            const filelocation = "get_driver_by_email.js"
            logging(messagetype,message,filelocation)
            return res.status(400).json({message:"No values hasbeen provided"})
        }
        const get_vo_db = await prisma.assigntovehicleowener.findFirstOrThrow({
            where:{
                OR:[
                    {vehicleoweneremail:get_vehicleoweneremail},
                    {uid:uid}
                ]
             
            },select:{
                uid:true,
                vehicleowenerfirstname:true,
                vehicleowenerlastename:true,
                vehicleoweneremail:true,
                vehicleoweneraddress:true,
                vehicleowenergovdocs:true,
                vehicleowenerid:true,
                vehicleowenerlicense:true,
                vehicleowenernationality:true,
                vehicleowenerrole:true,
                vehicles:true
            }
        })
        const messagetype = "success"
        const message = `Vehicle owener data by email ${JSON.stringify(get_vo_db)}`
        const filelocation = "get_driver_by_email.js"
        logging(messagetype,message,filelocation)
        await setCache
        return res.status(200).json({message:"All of the data",data:get_vo_db})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = ` error occurred ${error}`
        const filelocation = "get_driver_by_email.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:"Something went wrong please try again",data:error})
    }
}

export default retrive_vehicle_owener_data_by_email