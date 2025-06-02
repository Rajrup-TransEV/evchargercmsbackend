// register a new driver 
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../lib/customuids.js";

const prisma = new PrismaClient();
const createdriver = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "driver_create.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {uid,vehicleowenerfirstname,vehicleowenerlastename,vehicleoweneremail,phonenumber,vehicleowenerlicense,vehicleowenergovdocs,vehicleowenernationality,adminid,vehicleoweneraddress,vehicleowenerrole} = req.body;
    
    try {
        if(uid===""||vehicleowenerfirstname===""||vehicleowenerlastename===""||vehicleoweneremail===""||phonenumber===""||vehicleowenerlicense===""||vehicleowenergovdocs===""||vehicleowenernationality===""||adminid===""||vehicleoweneraddress===""||vehicleowenerrole===""){
            const messagetype = "error"
            const message = "Fields has to given in order to create vehicle owener details"
            const filelocation = "driver_create.js"
            logging(messagetype,message,filelocation)
            return res.status(403).json({ message: "Fields has to given in order to create vehicle owener details" })
        }
        const getvehicleoweneremail = await prisma.assigntovehicleowener.findFirst({
            where:{
                OR:[
                    {uid:uid},
                    {vehicleoweneremail:vehicleoweneremail},
                    {vehicleowenerlicense:vehicleowenerlicense},
                    {phonenumber:phonenumber}
                ]
                
            },select:{
                vehicleoweneremail:true,
                vehicleowenerlicense:true,
                phonenumber:true
            }
        })
    
        if(getvehicleoweneremail){
            const messagetype = "error"
            const message = "Driver is already register please use another email and driving license"
            const filelocation = "driver_create.js"
            logging(messagetype,message,filelocation)
            return res.status(409).json({message:"Driver is already register please use another email and driving license"})
        }
        const roleRegex = /^vehicleowener$/i; // Matches "driver" in a case-insensitive manner
        console.log(vehicleowenerrole)
        console.log(roleRegex.test(vehicleowenerrole))
        if (!roleRegex.test(vehicleowenerrole)) {
            const messagetype = "error"
            const message = `Vehicle owener can have only 'vehicleowener' role assigned, nothing else`
            const filelocation = "driver_create.js"
            logging(messagetype,message,filelocation)
            return res.status(403).json({ message: `Vehicle owener can have only 'vehicleowener' role assigned, nothing else` });
        }
        const create_driver_data = await prisma.assigntovehicleowener.create({
            data:{
                uid:generateCustomRandomUID(),
                vehicleowenerfirstname:vehicleowenerfirstname,
                vehicleowenerlastename:vehicleowenerlastename,
                vehicleoweneremail:vehicleoweneremail,
                phonenumber:phonenumber,
                vehicleowenerlicense:vehicleowenerlicense,
                vehicleowenergovdocs:vehicleowenergovdocs,
                vehicleowenernationality:vehicleowenernationality,
                adminid:adminid,
                vehicleoweneraddress:vehicleoweneraddress,
                vehicleowenerrole:vehicleowenerrole
            }
        })
    
        if(!create_driver_data){
            const messagetype = "error"
            const message = `there is something wrong while create the driver`
            const filelocation = "driver_create.js"
            logging(messagetype,message,filelocation)
            return res.status(503).json("there is something wrong while create the driver ")
        }
        const messagetype = "success"
        const message = `Information hasbeen saved and driver has created successfully`
        const filelocation = "driver_create.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:"Information hasbeen saved and driver has created successfully"})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `Something went wrong please check error details ${error}`
        const filelocation = "driver_create.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:`Something went wrong please check error details ${error}`})
    }
   
}

export default createdriver;