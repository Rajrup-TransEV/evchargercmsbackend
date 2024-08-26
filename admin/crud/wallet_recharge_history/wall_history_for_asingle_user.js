//wallet recharge history for a single user 
//find recharge history of a single user 
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();
const find_wh_o_s_w = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      const messagetype = "error"
      const message = "API route access error"
      const filelocation = "get_all_wallet_recharge_history.js"
      logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
  //taking wallet history id and wallet unique id 
    const {whid,whuid}=req.body;
    try {
        const findwh = await prisma.walletreachargehistory.findMany({
            where:{
                OR:[
                    {uid:whid},
                    {userassociatedid:whuid}
                ]
            }
        })
        res.status(200).json({
            message:"Success with follwoing details",
            data:findwh
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:"Error occurred",
            error:error
        })
    }
   


}

export default find_wh_o_s_w;