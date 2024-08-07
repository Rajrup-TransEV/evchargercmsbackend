//get all of the vehicle stored inside the database
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
const prisma = new PrismaClient();


const get_all_vehicles = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "get_all_vehicle_assign.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    try {
        const listofvehilcles = await prisma.assigntovechicles.findMany()
        const messagetype = "success"
        const message = `All of the vehicles are  ${listofvehilcles}`
        const filelocation = "get_all_vehicle_assign.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({data:listofvehilcles})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `${JSON.stringify(error)}`
        const filelocation = "get_all_vehicle_assign.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:error})
    }
}

export default get_all_vehicles