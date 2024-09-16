//get driver by email
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import { getCache, setCache } from "../../../utils/cacheops.js";

const prisma = new PrismaClient();
const getdriverbyadminid = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
       const messagetype = "error"
       const message = "API route access error"
       const filelocation = "get_driver_list_by_adminid.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {adminid}=req.body

    try {
        const cacheddata = await getCache("getdlba")
        if(cacheddata){
            const messagetype ="success"
            const message = "All of the data get from cache"
            const filelocation = "get_all_vehicledata.js"
            logging(messagetype,message,filelocation)
            return res.status(200).json({message:message,data:cacheddata})
        }
        const getdriverdata = await prisma.assigntovehicleowener.findMany({
            where:{
                adminid:adminid
            },select:{
                id:true,
                uid:true,
                vehicleowenerfirstname:true,
                vehicleowenerlastename:true,
                vehicleoweneremail:true,
                phonenumber:true,
                vehicleowenerlicense:true,
                vehicleowenergovdocs:true,
                vehicleowenernationality:true,
                vehicleoweneraddress:true,
                vehicleowenerrole:true,
                vehicles:true
            }
            
        })
        const messagetype = "success"
        const message = `All of the data`
        const filelocation = "get_driver_list_by_adminid.js"
        logging(messagetype,message,filelocation)
        await setCache("getdlba",getdriverdata,3600)
        return res.status(200).json({message:"All of the data",data:getdriverdata})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `${error}`
        const filelocation = "get_driver_list_by_adminid.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({error:error})
    }

}

export default getdriverbyadminid