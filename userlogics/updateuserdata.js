//update normal user data // all of the core logics hasbeen written here 

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const applyupdate = async (req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {userid} = req.body

    const checkdata = await prisma.user.findFirstOrThrow({
        where:{
            uid:userid
        }
    }) 
    if(!checkdata){
        return res.status(404).json({message:"Unfortunately no user hasbeen found associated with this id"})
    }
}