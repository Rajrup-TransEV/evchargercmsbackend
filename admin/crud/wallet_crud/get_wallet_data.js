//get all of the wallet data
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();
const get_all_wallet_data = async (req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      const messagetype = "error"
      const message = "API route access error"
      const filelocation = "get_wallet_data.js"
      logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
  try {
    const allwalletdata = await prisma.wallet.findMany()
    const messagetype = "success"
    const message = "All the wallets are coming"
    const filelocation = "get_wallet_data.js"
    logging(messagetype,message,filelocation)
    return res.status(200).json({message:"All of the available data",details:allwalletdata
    })
  } catch (error) {
    console.log(error)
    const messagetype = "error"
    const message = `Error  -> ${error}`
    const filelocation = "get_wallet_data.js"
    logging(messagetype,message,filelocation)

  }

  
}

export default get_all_wallet_data