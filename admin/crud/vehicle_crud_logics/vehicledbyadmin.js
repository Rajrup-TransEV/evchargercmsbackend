//vehicler adminjs
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../lib/customuids.js";

const prisma = new PrismaClient();

const vehicledetailsbyadminid = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "vehicledbyadmin.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const {adminid} = req.body

    try {
        const userprofiledetails = await prisma.userProfile.findFirst({
            where:{
                uid:adminid
            },select:{
                firstname:true,
                lastname:true,
                email:true,
                phonenumber:true
            }
        })
        const vehicledetails = await prisma.assigntovechicles.findMany({
            where:{
                
                adminuid:adminid
            }
        })
        const messagetype = "success";
        const message = "Detailshabeenfetched";
        const filelocation = "vehicledbyadmin.js";
        logging(messagetype, message, filelocation);
        return res.status(200).json({message:"your details",user:userprofiledetails,vehicle:vehicledetails})
    } catch (error) {
        console.log()
        const messagetype = "error";
        const message = `${error}`;
        const filelocation = "vehicledbyadmin.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({message:"all the details",error:error})
    }
}

export default vehicledetailsbyadminid