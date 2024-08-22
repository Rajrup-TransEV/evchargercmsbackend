//delete wallet data
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();
const deletewalletdata = async(req,res)=>{
    const {walletid} = req.body;
    try {
        const deletedata = await prisma.wallet.delete({
            where:{
                uid:walletid
            }
        })
         return res.status(200).json({
            message:"wallet data hasbeen deleted"
         })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message:`error deleting data ${error}`
        })
    }
 
}
export default deletewalletdata;