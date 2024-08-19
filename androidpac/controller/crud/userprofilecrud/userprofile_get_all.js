// user profile get all data
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const getalluserprofile = async(req,res)=>{

    try {
        const getalldata = await prisma.appUserProfile.findMany({
            select:{
                uid:true,
                firstname:true,
                lastname:true,
                bio:true,
                address:true,
                phonenumber:true,
                user:true
            }
        })
        if(!getalldata){
            return res.status(404).json({message:"Data not found"})
        }
        return res.status(200).json({message:"All of the data",userprofile:getalldata})
    } catch (error) {
        return res.status(500).json({message:"Error occurred",data:error})
    }
   
}

export default getalluserprofile