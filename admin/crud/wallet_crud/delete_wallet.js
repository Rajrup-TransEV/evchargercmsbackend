//delete wallet data
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();
const deletewalletdata = async(req,res)=>{
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "delete_wallet.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {walletid} = req.body;
    try {
        if(walletid===""){
            const messagetype = "error";
            const message = "wallet id is required to delete the wallet";
            const filelocation = "delete_wallet.js";
            logging(messagetype, message, filelocation);
            return res.status(400).json({message:"wallet id is required to delete the wallet"})
        }
        const deletedata = await prisma.wallet.delete({
            where:{
                uid:walletid
            }
        })
        const messagetype = "success";
        const message = "wallet data hasbeen deleted";
        const filelocation = "delete_wallet.js";
        logging(messagetype, message, filelocation);
         return res.status(200).json({
            message:"wallet data hasbeen deleted"
         })
    } catch (error) {
        console.log(error)
        const messagetype = "error";
        const message = `Error while deleting the wallet ${error}`;
        const filelocation = "delete_wallet.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({
            message:`error deleting data ${error}`
        })
    }
 
}
export default deletewalletdata;