//create charger bookings
//vehicler adminjs
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../lib/customuids.js";
import generateRandomUID from "../../../../lib/generaterandomuid.js";

const prisma = new PrismaClient();
const chargerbookings = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "chargerbookings.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {chargeruid,useruid,isbooked}=req.body
    try {
        const createdata = await prisma.bookings.create({
            data:{
                uid:generateRandomUID(),
                chargeruid:chargeruid,
                useruid:useruid,
                isbooked:isbooked
            }
        })
    } catch (error) {
        console.log(error)
    }
}

export default chargerbookings