//delete a financial data
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();
const deletefinancialdata = async (req,res)=>{
    try {
        const apiauthkey = req.headers['apiauthkey'];
    
        // Check if the API key is valid
        if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
            const messagetype = "error"
            const message = "API route access error"
            const filelocation = "delete_financialdata.js"
            logging(messagetype,message,filelocation)
            return res.status(403).json({ message: "API route access forbidden" });
        }
        const {finuid}  = req.body;
        const deltedata = await prisma.financial_details.delete({
            where:{
                uid:finuid,
            }
        })
        if(!deltedata){
            const messagetype = "error"
            const message = "no data found associated with the id"
            const filelocation = "delete_financialdata.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json({message:"no data found associated with the id"})
        }
        const messagetype = "success"
        const message = "financial data hasbeen deleted successfully"
        const filelocation = "delete_financialdata.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:"financial data hasbeen deleted successfully"})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `error deleting data ${error}`
        const filelocation = "delete_financialdata.js"
        logging(messagetype,message,filelocation)
        return res.status(500).josn({message:"error deleteting data",data:error})
    }
}

export default deletefinancialdata