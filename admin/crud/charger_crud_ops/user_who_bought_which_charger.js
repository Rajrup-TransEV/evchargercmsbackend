//charger fetch data fileter by user id
//means which user bought which charger or list of charges


import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
const prisma = new PrismaClient();
const user_who_bought_the_charger_details =  async(req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "user_who_bought_which_charger.js"
        logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
    const {get_charger_id,get_user_id}  =  req.body;

    try {
        const get_charger_details  = await prisma.charger_Unit.findMany(
            {
                where:{
                   OR:[
                    {
                        uid:get_charger_id,
                        userId:get_user_id
                    }
                   ]
                },
                select:{
                    uid:true,
                    Chargerserialnum:true,
                    ChargerName:true,
                    Chargerhost:true,
                    Segment:true,
                    Subsegment:true,
                    Total_Capacity:true,
                    Chargertype:true,
                    parking:true,
                    number_of_connectors:true,
                    Connector_type:true,
                    connector_total_capacity:true,
                    lattitude:true,
                    longitute:true,
                    full_address:true,
                    charger_use_type:true,
                    twenty_four_seven_open_status:true,
                    userId:true,
                    createdAt:true,
                }
            }
        )
        if(!get_charger_details){
            const messagetype = "error"
            const message = "user has not bought any charger still now"
            const filelocation = "user_who_bought_which_charger.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json("user has not bought any charger still now")
        }
    
        const associate_user  = await prisma.userProfile.findFirstOrThrow({
            where:{
                uid:get_charger_details.userId
            },
        })
        if(!associate_user){
            const messagetype = "error"
            const message = "no user hasbeen found with the given user id"
            const filelocation = "user_who_bought_which_charger.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json("no user hasbeen found with the given user id")
        }
        const messagetype = "success"
        const message = "Charger associated with the user hasbeen fetched successfully"
        const filelocation = "user_who_bought_which_charger.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({userdetails:associate_user,user_chargerunit_details:get_charger_details})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `Something went wrong - ${error}`
        const filelocation = "user_who_bought_which_charger.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:"Something went wrong",data:error})
    }
  
}

export default user_who_bought_the_charger_details;