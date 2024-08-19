//andorid app user profile create 
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userprofilecreate = async (req,res)=>{
    const {firstname,lastname,bio,address,phonenumber,userid}=req.body
    try {
    const userprofilecreate = await prisma.appUserProfile.create({
        data:{
            uid:crypto.randomUUID(),
        firstname:firstname,
        lastname:lastname,
        bio:bio,
        address:address,
        phonenumber:phonenumber,
        userId:userid
        }
    })
    if(!userprofilecreate){
        return res.status(400).json({message:"Something went wrong please try again"})
    }
    return res.status(200).json({message:"Userprofile hasbeen created successfully"})
    } catch (error) {
        console.log(error)
    }
}

export default userprofilecreate