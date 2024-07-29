//get all of the stored financial details 
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getallfinancialdetails  =  async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        return res.status(403).json({ message: "API route access forbidden" });
    }
    try {
        const allfinancialaccountdetails = await prisma.financial_details.findMany()
            if(!allfinancialaccountdetails){
                return res.status(404).json("no financial details found please enter some details in db first")
            }

            return res.status(200).json({data:allfinancialaccountdetails})
    } catch (error) {
        console.log(error)
    }

}

export default getallfinancialdetails