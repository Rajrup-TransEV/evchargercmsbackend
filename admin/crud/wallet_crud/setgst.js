import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient(); 

const setgst = async(req, res)=>{
    try {
        const {gst } = req.body;
        const existinggst = await prisma.walletHardLimit.findFirst();
        if(existinggst){
            await prisma.walletHardLimit.update({
                where:{id:existinggst.id},
                data:{hardlimit:hardlimit}
            })
            const messagetype = "success";
            const message = "Wallet hard limit updated successfully";
            const filelocation = "setwallethardlimit.js";
            logging(messagetype, message, filelocation);
            return res.status(200).json({ message: "Wallet hard limit updated successfully" });
        }else{
            await prisma.walletHardLimit.create({
                data:{
                    uid:crypto.randomUUID(),
                    hardlimit:hardlimit
                }
            })
            const messagetype = "success";
            const message = "Wallet hard limit created successfully";
            const filelocation = "setwallethardlimit.js";
            logging(messagetype, message, filelocation);
            return res.status(200).json({ message: "Wallet hard limit created successfully" });
        }
    } catch (error) {
        logging("wallet_hard_limit_error", error.message, "setwallethardlimit.js");
        return res.status(500).json({ status: "Error", message: error.message });
    }
}

export default setgst;