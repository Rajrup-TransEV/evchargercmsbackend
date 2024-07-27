//create financial details associated with the user
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()


const  add_user_financial_details=async (req,res)=>{
    const user_id_capture = req.id
}