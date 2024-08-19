// update user related profile information
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userprofileupdate = async(req,res)=>{
    const {uid,firstname,lastname,bio,address,phonenumber}=req.body

    try {
        const userProfile = await prisma.appUserProfile.findFirstOrThrow({
            where:{
                uid:uid
            }
        })
        if(!userProfile){
            return res.status(404).json({error:"user profile data not found"})
        }
        const updateData = {};
        if(firstname){
            updateData.firstname = firstname
        }
        if(lastname){
            updateData.lastname = lastname;
        }
        if(bio){
            updateData.bio = bio;
        }
        if(address){
            updateData.bio = address;
        }
        if(phonenumber){
            updateData.phonenumber= phonenumber
        }
        const updatedUserProfile = await prisma.appUserProfile.update({
            where:{uid:uid},
            data:updateData
        })
        //return the updated user profile

        return res.status(200).json({message:"updated user profile data",data:updateData})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Error occurred",error:error})
    }
}

export default userprofileupdate