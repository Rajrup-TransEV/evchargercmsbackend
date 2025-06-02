//get any wallet details using admin user ud
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../lib/customuids.js";


const prisma = new PrismaClient();

const walletdatagetbyadminid = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "walletdatagetbyadminid.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const {adminid} = req.body;

    try {
        const walletdata = await prisma.wallet.findMany({
            where:{
                associatedadminuid:adminid
            }
        })
        const messagetype = "success";
        const message = "Wallet data hasbeen fetched successfully for the admin";
        const filelocation = "walletdatagetbyadminid.js";
        logging(messagetype, message, filelocation);
        return res.status(200).json({message:"all of the wallet data under the admin",data:walletdata})
    } catch (error) {
        console.log(error)
        const messagetype = "error";
        const message = `${error}`;
        const filelocation = "walletdatagetbyadminid.js";
        logging(messagetype, message, filelocation);
    }
  

}

export default walletdatagetbyadminid