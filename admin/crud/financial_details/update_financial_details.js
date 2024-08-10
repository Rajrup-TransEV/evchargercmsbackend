//update a financialdetails of a user
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();


const updatefinancialdata = async (req,res)=>{
    try {
        const apiauthkey = req.headers['apiauthkey'];
    
        // Check if the API key is valid
        if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
            const messagetype = "error"
            const message = "API route access error"
            const filelocation = "update_financial_details.js"
            logging(messagetype,message,filelocation)
            return res.status(403).json({ message: "API route access forbidden" });
        }
    
        const {finuid,bank_account_number,isfc_code,bank_name,branch_name,branch_address}=req.body
    
        const getfindatafromdb = await prisma.financial_details.findFirstOrThrow({
            where:{
                uid:finuid
            }
        }) 
        if(!getfindatafromdb){
            const messagetype = "error"
            const message = "no data found"
            const filelocation = "update_financial_details.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json("no data found")
        }
        //capture the data into a json based array
        const capupdatefindata = {}
    // Only add fields that are provided in the request body
    if (bank_account_number) capupdatefindata.bank_account_number = bank_account_number;
    if (isfc_code) capupdatefindata.isfc_code = isfc_code;
    if (bank_name) capupdatefindata.bank_name = bank_name;
    if (branch_name) capupdatefindata.branch_name = branch_name;
    if (branch_address) capupdatefindata.branch_address = branch_address;
    
    
        const updatedata = await prisma.financial_details.update({
            where:{
                uid:finuid
            },
            data: capupdatefindata
        })
        const messagetype = "success"
        const message = "findancial data hasbeemn updated successfully"
        const filelocation = "update_financial_details.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:"findancial data hasbeemn updated successfully",data:updatedata});
    } catch (error) {
     console.log(error)   
     const messagetype = "error"
     const message =  `error updating data details :: ${error}`
     const filelocation = "update_financial_details.js"
     logging(messagetype,message,filelocation)
     return res.status(500).json({ error:`error updating data details :: ${error}` });
    }
   
}

export default updatefinancialdata