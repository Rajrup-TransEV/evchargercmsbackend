//get a single charger hub details by admin id or the 
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import { getCache, setCache } from "../../../utils/cacheops.js";
const prisma = new PrismaClient();

const GetSingleHubDetails = async (req,res)=>{
    
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "get_single_hub_details.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {adminid,uid}=req.body
    try {
        const getdetails = await prisma.addhub.findFirst({
            where:{
                OR:[
                    {adminid:adminid},
                    {uid:uid}
                ]
            }
        })

        return res.status(200).json({message:"requested data",data:getdetails})
    } catch (error) {
        console.log(error)
    }
}


export default GetSingleHubDetails