//recharge and initialize wallet
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const rechargewallet = async (req,res)=>{
    const  {userid,walletid,price}=req.body;
    if(price<=100){
        return res.status(400).json({message:"price cannot be less than 100 or in negetive"})
    }
    try {
        
    const walletfind = await prisma.wallet.findUnique({
        where:{
            uid:walletid
        }
    })
    if(!walletfind){
        return res.status(404).json({message:"error no wallet data found"})
    }
    const findAppUserProfile =await prisma.user.findUnique({
        where:{uid:userid},
        select:{uid:true}
    })
     // Check if the user exists in userProfile
     const findAdminUserProfile = await prisma.userProfile.findUnique({
        where: { uid: userid },
        select: { uid: true }
    });

    if(findAppUserProfile){
        const wallettopupforappuser = await prisma.wallet.update({
            where:{
                uid:walletid
            },
            data:{   
                    balance:price,
                    iswalletrechargedone:true,
                    recharger_made_by_which_user:userid
            }
        })
        return res.status(201).json({
            message:"wallet recharge done",
            details:wallettopupforappuser
        })
    }else if (findAdminUserProfile){
       const wallettopupforappprofile =await prisma.wallet.update({
        where:{
            uid:walletid
        },
        data:{
            balance:price,
            iswalletrechargedone:true,
            recharger_made_by_which_user:userid
        }
       })
       return res.status(201).json({
        message:"wallet recharge done",
        details:wallettopupforappprofile
       })
    }else{
        return res.status(404).json({
            message:"No data found"
        })
    }
    } catch (error) {
     console.log(error)   
     return res.status(500).json({
        message:"An error while creating the wallet",
        error:error
     })
    }
}
export default rechargewallet