//resolve support
import { PrismaClient } from "@prisma/client"; 
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();


const resolvesupport=async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "resolvesupport.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {uid}=req.body;
    try {
        const status  = await prisma.helpandSupport.findFirstOrThrow({
            where:{uid:uid},
            select:{messagestatus:true}
        })
        if (!status) {
            return res.status(404).json({ message: "Dispute not found" });
        }
        //Update the support with the new resolve status
        //toggle status
        const newResolvedStatus = !status.messagestatus;
        await prisma.helpandSupport.update({
            where:{uid:uid},
            data:{messagestatus:newResolvedStatus}
        })
        const messagetype = "success";
        const message = `status has been updated to ${newResolvedStatus ? 'resolved' : 'not resolved'}`;
        const filelocation = "resolvesupport.js";
        logging(messagetype, message, filelocation);
        return res.status(200).json({ message: `This issue has been marked as ${newResolvedStatus ? 'resolved' : 'not resolved'}` });
    } catch (error) {
        console.log(error)
        const messagetype = "error";
        const message = `${error.message || error}`;
        const filelocation = "resolvesupport.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({ error: error.message || "An error occurred" });
    }
}

export default resolvesupport