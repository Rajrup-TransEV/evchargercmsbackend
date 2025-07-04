//get all of the wallet data
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import { getCache, setCache } from "../../../utils/cacheops.js";

const prisma = new PrismaClient();

const getwalletdatabyuserid = async (req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      const messagetype = "error"
      const message = "API route access error"
      const filelocation = "get_wallet_data.js"
      logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
  const {userid} = req.body;
  try {
    const walletdata = await prisma.wallet.findFirstOrThrow({
        where:{
            appuserrelatedwallet:userid
        },select:{
            balance:true,
            uid:true,
            createdAt:true,
            updatedAt:true,
            
        }
    })
    const messagetype = "success"
    const message = "Wallet data hasbeen fetched successfully for the user"
    const filelocation = "getwalletbyuserid.js"
    logging(messagetype,message,filelocation)
    return res.status(200).json({message:"Wallet data hasbeen fetched successfully for the user",data:walletdata})
  } catch (error) {
    console.log(error)
    const messagetype = "error"
    const message = `${error}`
    const filelocation = "getwalletbyuserid.js"
    logging(messagetype,message,filelocation)
    return res.status(500).json({error:error})
  }
}

export default getwalletdatabyuserid;