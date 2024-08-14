//deleta user profile data 
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const delete_user_profile = async (req,res)=>{
    const {uid} = req.body ;

    try {
        const deletedata = await prisma.appUserProfile.delete({
            where:{
                uid:uid
            }
        })
        if(!deletedata){
                return res.status(404).json({message:"404 no data hasbeen found"})
        }
        return res.status(200).json({message:"your data hasbeen deleted successfully"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"error occurred",data:error})
    }
}

export default delete_user_profile