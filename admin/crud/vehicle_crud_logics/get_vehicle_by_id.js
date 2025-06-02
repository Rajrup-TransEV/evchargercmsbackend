//get single vehicle details by id 
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../lib/customuids.js";

const prisma = new PrismaClient();
const getvehiclebyid = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "vehicle_create.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }
const {userid}=req.body;
try {
    const getdata = await prisma.assigntovechicles.findMany({
        where:{
            OR:[
                {vehicleowenerId:userid},
                {userId:userid}
            ]
        }
    })
    return res.status(200).json({data:getdata})
} catch (error) {
    console.log(error)
    return res.status(500).json({error:error})
}

}

export default getvehiclebyid