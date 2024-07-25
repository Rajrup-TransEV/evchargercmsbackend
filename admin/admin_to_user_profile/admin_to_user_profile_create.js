//super admin can able to generate admin below is the wirtten logic
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"


const prisma = new PrismaClient()

 const admincreateuser = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
      // Check if the API key is valid
      if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const {firstname,lastname,email,phonenumber,password,role,designation,address}= req.body;
    console.log(req.body)
    try {
        const findExistingUser = await prisma.userProfile.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phonenumber: phonenumber }
                ]
            },
            select: {
                email: true,
                phonenumber: true
            }
        });
        if (findExistingUser){
            return res.status(409).json({message:"One of user's details already exists , email,phone,or  username"})
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt); 
        const createadminprofile = await prisma.userProfile.create({
            data:{
                uid:crypto.randomUUID(),
                firstname:firstname,
                lastname:lastname,
                email:email,
                phonenumber:phonenumber,
                password:hashedPassword,
                role:role,
                designation:designation,
                address:address
            }
        })
        if(!createadminprofile){
            return res.statu(503).json({message:"user creation failed"})
        }
        return res.status(201).json({message:"User hasbeen created successfully"})
    } catch (err) {
     return res.status(500).json({message:`something went wrong with the server:: ${err} `})   
    }
}

export default admincreateuser