// delete a user data from data base 

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const delete_user_data  =  async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "delete_a_user.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {userid,email}=req.body
    try {
        if(userid===""||email===""){
            const messagetype = "error"
            const message = "Necessary fields cannot be empty"
            const filelocation = "delete_a_user.js"
            logging(messagetype,message,filelocation)
            return res.status(400).json({message:"Necessary fields cannot be empty"})
        }
        const get_user_data = await prisma.user.deleteMany({
            where:{
                OR:[
                    {uid:userid},
                    {email:email}
                ]
            }
        })
        if(!get_user_data){
            return res.status(404).json({message:"No user data found or already deleted"})
        }
        return res.status(200).json({message:"user data hasbeen deleteted successfully"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:`An error occurred ${error}`})
    }
}
export default delete_user_data