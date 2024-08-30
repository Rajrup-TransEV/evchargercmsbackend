//  get user profile data by email
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
const prisma = new PrismaClient();


const get_single_admin_data = async (req,res)=>{

    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
        if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "get_admin_data_by_email.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const {useremail} = req.body;
    if(useremail===""){
        const messagetype = "error"
        const message = "No value provided for one or more fields."
        const filelocation = "get_admin_data_by_email.js"
        logging(messagetype,message,filelocation)
        return res.status(400).json({ error: 'No value provided for one or more fields.' });
      }
    try {
        const get_from_db = await prisma.userProfile.findFirstOrThrow({
            where:{
                email:useremail
            },select:{
                uid:true,
                email:true,
                firstname:true,
                lastname:true,
                phonenumber:true,
                role:true,
                address:true,
                designation:true,
                chargerUnits:true,
                financialDetails:true,
                createdAt:true,
                updatedAt:true,
            }
        })
        if(!get_from_db){
            const messagetype = "error"
            const message = "data not found"
            const filelocation = "get_admin_data_by_email.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json({message:"data not found"})
        }
        const messagetype = "success"
        const message = "Data is returning"
        const filelocation = "get_admin_data_by_email.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:"Requested data is ", data:get_from_db})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `error occurred - ${error}`
        const filelocation = "get_admin_data_by_email.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:`error occurred - ${error}`})
    }
   

}
export default get_single_admin_data