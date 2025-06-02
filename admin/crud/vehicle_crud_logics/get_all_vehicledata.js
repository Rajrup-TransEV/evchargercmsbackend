//get all of the vehicle stored inside the database
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import { getCache, setCache } from "../../../utils/cacheops.js";
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
        //find data from cache first
        const cacheddata = await getCache("getallvehicledata");
        if (cacheddata){
            const messagetype ="success"
            const message = "All vehicle data hasbeen listed"
            const filelocation = "get_all_vehicledata.js"
            logging(messagetype,message,filelocation)
            return res.status(200).json({message:message,data:cacheddata})
        }
        const listofvehilcles = await prisma.assigntovechicles.findMany()
        const messagetype = "success"
        const message = `All of the vehicles are  ${listofvehilcles}`
        const filelocation = "get_all_vehicle_assign.js"
        logging(messagetype,message,filelocation)
        await setCache("getallvehicledata",listofvehilcles,3600)
        return res.status(200).json({message:"List of data",data:listofvehilcles})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `${error}`
        const filelocation = "get_all_vehicle_assign.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:error})
    }
}

export default get_all_vehicles