// vehicle creation logic .
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();


const vehilcle_create = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
       const messagetype = "error"
       const message = "API route access error"
       const filelocation = "vehicle_create.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {uid,vehiclename,vehiclemodel,vehiclelicense,vehicleowner,vehicletype,vehiclecategory} = req.body;

   
    try {
        const vehicledatamatch = await prisma.assigntovechicles.findFirst({
            where:{
                    vehiclelicense:vehiclelicense
            },select:{
                vehiclelicense:true
            }
        })
        if (vehicledatamatch){
            const messagetype = "error"
            const message = "A vehicle with the same license already exists"
            const filelocation = "vehicle_create.js"
             logging(messagetype,message,filelocation)
            return res.status(409).json({message:`A vehicle with the same license already exists`})
        }
        const vehicledatacreate  = await prisma.assigntovechicles.create({
               data:{
                uid:crypto.randomUUID(),
                vehiclename:vehiclename,
                vehiclemodel:vehiclemodel,
                vehiclelicense:vehiclelicense,
                vehicleowner:vehicleowner,
                vehicletype:vehicletype,
                vehiclecategory:vehiclecategory,
               }
        })
        
        if(!vehicledatacreate){
            const messagetype = "error"
            const message = "There is something wrong"
            const filelocation = "vehicle_create.js"
            logging(messagetype,message,filelocation)
            return res.status(503).json({message:`There is something wrong`})
        }
        const messagetype = "success"
        const message = "Vehicle data has successfully saved"
        const filelocation = "vehicle_create.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:"Vehicle data has successfully saved"})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `${JSON.stringify(error)}`
        const filelocation = "vehicle_create.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:error})
    }
}

export default vehilcle_create;