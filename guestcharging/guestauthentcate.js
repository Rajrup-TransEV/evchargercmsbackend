import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const GuestAuth = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "guestauthentcate.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const {phonenumber,otp}=req.body;
    try {
        
    } catch (error) {
        
    }
}

export default GuestAuth
