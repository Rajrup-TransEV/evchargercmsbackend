//get all wallet recharge history
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

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
        const getall_wallet_history = await prisma.walletreachargehistory.findMany()
        const messagetype = "success"
        const message = "here is all of the wallet history data"
        const filelocation = "get_all_wallet_recharge_history.js"
        logging(messagetype,message,filelocation)
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