// create a dispute form and save the data to database
import { PrismaClient } from "@prisma/client";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../lib/customuids.js";
const prisma = new PrismaClient()
const disputeformcreate = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "disputeformcreate.js"
        logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
    const {customername,relatedtoev,reason,morethanonecharge,wrongcharged,didnotreceiverefund,
        paidforothermeans,disputtransaction,chargedregularly,notlistedabove,
        transactiondetails,disputedetails,associatedadminid,userid
    }=req.body
    try {
        const savedetails = await prisma.disputFrom.create({
            data:{
                uid:generateCustomRandomUID(),
                userid:userid,
                customername:customername,
                relatedtoev:relatedtoev,
                reason:reason,
                morethanonecharge:morethanonecharge,
                wrongcharged:wrongcharged,
                didnotreceiverefund:didnotreceiverefund,
                paidforothermeans:paidforothermeans,
                disputtransaction:disputtransaction,
                chargedregularly:chargedregularly,
                notlistedabove:notlistedabove,
                transactiondetails:transactiondetails,
                disputedetails:disputedetails,
                associatedadminid:associatedadminid
            }
        })
        const messagetype = "success"
        const message = "Dispute form data hasbeen saved successfully"
        const filelocation = "disputeformcreate.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:"Information hasbeen saved successfully",data:savedetails})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `${error}`
        const filelocation = "disputeformcreate.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({error:error})
    }
}

export default disputeformcreate