//get all of the stored financial details 
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js"
import { getCache, setCache } from "../../../utils/cacheops.js";
const prisma = new PrismaClient();

const getallfinancialdetails  =  async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "get_all_financial_details.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    try {
        //first try tp fetch data from cache 
        const cacheddata =  await getCache("getallfind");
        if(cacheddata){
            const messagetype ="success"
            const message = "All financial data hasbeen listed"
            const filelocation = "get_all_financial_details.js"
            logging(messagetype,message,filelocation)
            return res.status(200),json({message:message,data:cacheddata})
        }
        const allfinancialaccountdetails = await prisma.financial_details.findMany()
            if(!allfinancialaccountdetails){
                return res.status(404).json("no financial details found please enter some details in db first")
            }
            const messagetype = "success"
            const message = "API route access error"
            const filelocation = "get_all_financial_details.js"
            logging(messagetype,message,filelocation)
            await setCache("getallfind",allfinancialaccountdetails,3600)
            return res.status(200).json({message:"all the data are listed",data:allfinancialaccountdetails})
    } catch (error) {
        console.log(error)
        const messagetype = "success"
        const message = `Error while showing the data ${error}`
        const filelocation = "get_all_financial_details.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:"Error while showing the data",data:`${error}`})
    }

}

export default getallfinancialdetails