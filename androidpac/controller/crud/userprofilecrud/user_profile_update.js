// update user related profile information
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userprofileupdate = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "androidpac/user_profile_update.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {uid,firstname,lastname,bio,address,phonenumber}=req.body

    try {
        // if(!uid||!firstname||!lastname||!bio||!address||!phonenumber){
        //     const messagetype = "error"
        //     const message = "fields values are required"
        //     const filelocation = "androidpac/user_profile_update.js"
        //     logging(messagetype,message,filelocation)
        //     return res.status(400).json({message:"fields values are required"})
        // }
        const userProfile = await prisma.appUserProfile.findFirstOrThrow({
            where:{
                uid:uid
            }
        })
        if(!userProfile){
            const messagetype = "error"
            const message = "user profile data not found"
            const filelocation = "androidpac/user_profile_update.js"
            logging(messagetype,message,filelocation)
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
        const messagetype = "update"
        const message = "updated user profile data"
        const filelocation = "androidpac/user_profile_update.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:"updated user profile data",data:updateData})
    } catch (error) {
        console.log(error)
        const messagetype = "update"
        const message = `Internal server error ${error}`
        const filelocation = "androidpac/user_profile_update.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:"Error occurred",error:error})
    }
}

export default userprofileupdate