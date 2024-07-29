//delete a financial data
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const deletefinancialdata = async (req,res)=>{
    try {
        const apiauthkey = req.headers['apiauthkey'];
    
        // Check if the API key is valid
        if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
            return res.status(403).json({ message: "API route access forbidden" });
        }
        const {finuid}  = req.body;
        const deltedata = await prisma.financial_details.delete({
            where:{
                uid:finuid,
            }
        })
        if(!deltedata){
            return res.status(404).json({message:"no data found associated with the id"})
        }
        return res.status(200).json({message:"financial data hasbeen deleted successfully"})
    } catch (error) {
        console.log(error)
    }
}