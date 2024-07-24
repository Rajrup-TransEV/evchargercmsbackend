import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const prisma = new PrismaClient()

export const loginUser = async (req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      return res.status(403).json({ message: "API route access forbidden" });
  }
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
                uid:true,
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
        const token = jwt.sign(
            {
                username: existingUser.username,
                email: existingUser.email,
                userid:existingUser.uid,
                userType: existingUser.userType,
            },
            process.env.JWT_SECRET, // Make sure to set your JWT secret in environment variables
            { expiresIn: '1h' } // Token expiration time
        );
        
        return res.status(201).json({message:"Login success",authtoken:token})

    }catch(err){
        console.log(err)
    }
}