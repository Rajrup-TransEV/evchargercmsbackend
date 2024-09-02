//get only one user data by their id or email
import { Prisma, PrismaClient } from "@prisma/client";
import logging from "../../logging/logging_generate.js";

const prisma = new PrismaClient();


const get_one_user_data =  async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "get_one_user.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {userid,email} = req.body
    try {
        if(userid===""||email===""){
            const messagetype = "error"
            const message = "Required fields cannot be empty"
            const filelocation = "get_one_user.js"
            logging(messagetype,message,filelocation)
            return res.status(403).json({message:"Required fields cannot be empty"})
        }
        const get_user_data=await prisma.user.findFirstOrThrow({
            where:{
                OR:[
                    {uid:userid},
                    {email:email}
                ]
            },
            select:{
                username:true,
                email:true,
            }
        })
        if(!get_user_data){
            const messagetype = "error"
            const message = "no user hasbeen found with the data"
            const filelocation = "get_one_user.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json({message:"no user hasbeen found with the data"})
        }
        const messagetype = "success"
        const message = "User data hasbeen fetched successfully"
        const filelocation = "get_one_user.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:"User data hasbeen fetched successfully",data:get_user_data})
    } catch (error) {
        console.log(error)
        const messagetype = "success"
        const message = `Internal server error occurred ${error}`
        const filelocation = "get_one_user.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:`Something went wrong ${error}`})
    }
}

export default get_one_user_data