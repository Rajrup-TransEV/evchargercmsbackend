//get all wallet recharge history
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import { getCache, setCache } from "../../../utils/cacheops.js";

const prisma = new PrismaClient();
const get_all_wallet_recharge_history = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      const messagetype = "error"
      const message = "API route access error"
      const filelocation = "get_all_wallet_recharge_history.js"
      logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
    try {
        //find the data from the cache first
        const cacheddata=await getCache("gawrh")
        if(cacheddata){
            const messagetype = "success"
            const message = "all of the recharge historical data"
            const filelocation = "get_all_wallet_recharge_history.js"
            logging(messagetype,message,filelocation)
        }
        const getall_wallet_history = await prisma.walletreachargehistory.findMany()
        const messagetype = "success"
        const message = "here is all of the wallet history data"
        const filelocation = "get_all_wallet_recharge_history.js"
        logging(messagetype,message,filelocation)
        await setCache("gawrh",getall_wallet_history,3600)
        return res.status(200).json({
            message:"here is all of the wallet history data",
          data:getall_wallet_history  
        })
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `An error occurred ${error}`
        const filelocation = "get_all_wallet_recharge_history.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({
            error:error
        })
    }
   
}

export default get_all_wallet_recharge_history