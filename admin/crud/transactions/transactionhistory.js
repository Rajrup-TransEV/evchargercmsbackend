//list of transaction history
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
const prisma = new PrismaClient();
const thl = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "transactionhistory.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }

    try {
        const getlists = await prisma.transactionsdetails.findMany()
        const messagetype = "success"
        const message = "List of data accessed successfully"
        const filelocation = "transactionhistory.js"
        logging(messagetype,message,filelocation)
        res.status(200).json({
            message:"All of the data",
            data:getlists
        })   
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `${error}`
        const filelocation = "transactionhistory.js"
        logging(messagetype,message,filelocation)
        res.status(500).json({
            message:"Error occurred",
            error:error
        })
    }
}

export default thl;