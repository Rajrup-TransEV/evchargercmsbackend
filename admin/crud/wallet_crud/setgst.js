import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient(); 

const setgst = async(req, res)=>{
    try {
        const {gst } = req.body;
        const existinggst = await prisma.gstCreate.findFirst();
        if(existinggst){
            await prisma.gstCreate.update({
                where:{id:existinggst.id},
                data:{gst:gst}
            })
            const messagetype = "success";
            const message = "GST updated successfully";
            const filelocation = "setgst.js";
            logging(messagetype, message, filelocation);
            return res.status(200).json({ message: "GST updated successfully" });
        }else{
            await prisma.gstCreate.create({
                data:{
                    uid:crypto.randomUUID(),
                    gst:gst
                }
            })
            const messagetype = "success";
            const message = "GST created successfully";
            const filelocation = "setgst.js";
            logging(messagetype, message, filelocation);
            return res.status(200).json({ message: "GST created successfully" });
        }
    } catch (error) {
        logging("gst_error", error.message, "setgst.js");
        return res.status(500).json({ status: "Error", message: error.message });
    }
}

export default setgst;