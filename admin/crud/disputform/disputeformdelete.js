//diputeform delete
import { PrismaClient } from "@prisma/client";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const deletedisputeform = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "disputeformdelete.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {uid}=req.body;

    try {
       if(uid===""){
        const messagetype = "error"
        const message = "disputeform id is required to delete it"
        const filelocation = "disputeformdelete.js"
        logging(messagetype,message,filelocation)
        return res.status(400).json({ message: "disputeform id is required to delete it" });
       }
       //Delete te dispute form
       const deleteddf = await prisma.disputFrom.delete({
        where:{
            uid:uid
        }
       }) 
       const messagetype = "success"
       const message = "Charger unit deleted successfully"
       const filelocation = "disputeformdeletes.js"
       logging(messagetype,message,filelocation)
       return res.status(200).json({message:'Dispute form hasbeen deleted successfully'})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `${error}`
        const filelocation = "disputeformdeletes.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({error:error})
    }

}

export default deletedisputeform;