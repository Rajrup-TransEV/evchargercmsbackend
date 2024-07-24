//signup logic for normal user
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"
const prisma = new PrismaClient()

export const signupUser = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
      // Check if the API key is valid
      if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const { username, email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where:{
                email:email,
                username:username,
            },
            select:{
                email:true,
                username:true,
            }
        })
        if (user){
            return res.status(409).json({message:"User with the same email or username already exists"})
        }
        const salt = await bcrypt.genSalt(10); // Await the salt generation
        const hashedPassword = await bcrypt.hash(password, salt); // Await the hashing
        const uuid = crypto.randomUUID()
        const  newUser = await prisma.user.create({
            data:{
                username:username,
                uid:uuid,
                email:email,
                password:hashedPassword,
                userType:"user"
            }
        })
        if(newUser){
            console.log("usersignup completed")
           return res.status(201).json({ message: "User created successfully", user: username });
        }else{
            return res.status(503).json({message:"Something went worng with the server please try again"})
        }

    } catch (err) {
        console.log("the previous logic has failed to execute and error is ", err)
        return res.status(500).json({message:`${err}`})
    }
}