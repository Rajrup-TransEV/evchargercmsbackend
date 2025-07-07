import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

const setwallethardlimit = async (req, res) => {
    try {
        const {hardlimit } = req.body;
        const existinghardlimit = await prisma.walletHardLimit.findFirst();
        if(existinghardlimit){
            await prisma.walletHardLimit.update({
                where:{id:existinghardlimit.id},
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
};

export default setwallethardlimit;