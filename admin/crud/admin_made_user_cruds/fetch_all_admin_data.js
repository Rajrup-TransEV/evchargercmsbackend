//fetch all admin user data created by superuser
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import { getCache, setCache } from "../../../utils/cacheops.js";
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
        //check from redis cache first
        const cacheddata=await getCache("all_admin_user_data");
        if(cacheddata){
            const messagetype = "success"
            const message = "data retrive from cache"
            const filelocation = "fetch_all_admin_data.js";
            logging(messagetype,message,filelocation)
            return res.status(200).json({
                message:"Received data", data: cacheddata
            })
        }
        //analytics logic
        try {
            const userproflecount = await prisma.userProfile.count()
            const analyticslog = await prisma.analytics.create({
                data:{
                    uid:crypto.randomUUID(),
                    totalnumberofuserprofiles:userproflecount.toString()
                }
            })
            const messagetype = "success"
            const message = `In db there is ${userproflecount} number of userprofile hasbeen present`
            const filelocation = "fetch_all_admin_data.js"
            logging(messagetype,message,filelocation)
        } catch (error) {
            console.log(error)
            const messagetype = "error"
            const message = `There is an error occurred while generating analytics error details is ${error}`
            const filelocation = "fetch_all_admin_data.js"
            logging(messagetype,message,filelocation)
        }
       

        const fetchalldata = await prisma.userProfile.findMany()
        
        if(!fetchalldata){
            const messagetype = "error"
            const message = "There is not much data to show"
            const filelocation = "fetch_all_admin_data.js"
            logging(messagetype,message,filelocation)
            return res.status(503).json("There is not much data to show")
        }
        await setCache("all_admin_user_data",fetchalldata,3600)
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