// delete a user data from data base 

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const delete_user_data  =  async(req,res)=>{
   
    try {
        const {userid,email}=req.body
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