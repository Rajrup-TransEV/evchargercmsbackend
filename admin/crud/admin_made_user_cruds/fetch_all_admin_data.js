//fetch all admin user data created by superuser
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
const prisma = new PrismaClient();

const alladminuserdata=async (req,res)=>{
    console.log("get response receiving")
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
        if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "fetch_all_admin_data.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }

    try {
        console.log("try catch block running")
        const fetchalldata = await prisma.userProfile.findMany()
        console.log(fetchalldata)
        if(!fetchalldata){
            const messagetype = "success"
            const message = "There is not much data to show"
            const filelocation = "fetch_all_admin_data.js"
            logging(messagetype,message,filelocation)
            return res.status(503).json("There is not much data to show")
        }
        const messagetype = "success"
        const message = "list of admin data"
        const filelocation = "fetch_all_admin_data.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:"Received all data",data:fetchalldata})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `faield to show data ${error}`
        const filelocation = "fetch_all_admin_data.js"
        logging(messagetype,message,filelocation)
     return res.status(500).json(error)   
    }
}

export default alladminuserdata;