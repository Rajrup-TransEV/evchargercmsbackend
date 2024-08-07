//delete a vehilce data from database 
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
const prisma = new PrismaClient();

const deleteavehicledata = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {uid,license,vehicleowenerId}=req.body;
    try {
        
        const matchdata = await prisma.assigntovechicles.deleteMany({
            where:{
                OR:[
                    {uid:uid},
                    {vehicleowenerId:vehicleowenerId},
                    {vehiclelicense:license}
                ]
            }
        })

        if(!matchdata){
            const listofvehilcles = await prisma.assigntovechicles.findMany()
            const messagetype = "error"
            const message = `All of the vehicles are  ${listofvehilcles}`
            const filelocation = "get_all_vehicle_assign.js"
            logging(messagetype,message,filelocation)
            return res.status(400).json({message:"No associate vehile found or already deleted"})
        }
        const messagetype = "success"
        const message = `All of the vehicles are  ${JSON.parse(listofvehilcles)}`
        const filelocation = "get_all_vehicle_assign.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:"Data hasbeen deleted successfully"})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `message  ${JSON.stringify(error)}`
        const filelocation = "get_all_vehicle_assign.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:`${error}`})
    }
    
}

export default deleteavehicledata