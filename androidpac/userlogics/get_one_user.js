//get only one user data by their id or email
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const get_one_user_data =  async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        return res.status(403).json({ message: "API route access forbidden" });
    }
    try {
        const {userid,email} = req.body
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
            return res.status(404).json({message:"no user hasbeen found with the data"})
        }
        return res.status(200).json({message:"User data hasbeen update successfully",data:get_user_data})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:`Something went wrong ${error}`})
    }
}

export default get_one_user_data