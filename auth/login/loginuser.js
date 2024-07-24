import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const prisma = new PrismaClient()

export const loginUser = async (req,res)=>{
    const { username, email, password } = req.body;
    try{
        const existingUser = await prisma.user.findUnique({
            where:{
                email:email,
                username:username
            },
            select:{
                email:true,
                username:true,
                password:true,
                userType:true
            }
        })
        if(!existingUser){
            return res.status(404).json({message:"Wrong credentials"})
        }

        const checkPassword =  await bcrypt.compare(
            password,
            existingUser.password
        )
        if(!checkPassword){
            return res.status(404).json({message:"password doesnot match failed to login"})        
        }
        
        
        return res.status(201).json({message:"Login success"})

    }catch(err){
        console.log(err)
    }
}