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
      const filelocation = "wall_history_for_asingle_user.js"
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
        const messagetype = "success"
        const message = "Success with following details"
        const filelocation = "wall_history_for_asingle_user.js"
        logging(messagetype,message,filelocation)
        res.status(200).json({
            message:"Success with following details",
            data:findwh
        })

    } catch (error) {
        console.log(error)
        const messagetype = "success"
        const message =`Error occurred :: ${error}`
        const filelocation = "wall_history_for_asingle_user.js"
        logging(messagetype,message,filelocation)
        res.status(500).json({
            message:"Error occurred",
            error:error
        })
    }
   


}

export default find_wh_o_s_w;