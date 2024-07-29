//signup logic for normal user
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"
import nodemailer from "nodemailer";
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
        //opt verification process has start here 
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
        const transporter = nodemailer.createTransport({
            service:'Outlook365', // Use Outlook service
            auth: {
                user: process.env.OUTLOOK_EMAIL, // Your Outlook email
                pass: process.env.OUTLOOK_PASS // Your Outlook email password
            }
        });
        const mailOptions = {
            from: process.env.OUTLOOK_EMAIL,
            to: email,
            subject: 'Email Verification for Account Creation',
            text: `Your OTP for email verification is: ${otp}   ::: this otp only valid for 15 minutes`
        };
        await transporter.sendMail(mailOptions);
        const  newUser = await prisma.user.create({
            data:{
                username:username,
                uid:uuid,
                email:email,
                password:hashedPassword,
                userType:"user",
                otp: otp, // Store the generated OTP in the database
                otpExpiration: new Date(Date.now() + 15 * 60 * 1000) // Set OTP expiration to 15 minutes from now
            }
        })
        if(newUser){
            console.log("usersignup completed")
           return res.status(201).json({ message: "An OTP has been sent to your email for verification. Please enter the OTP to complete the signup process.", user: username });
        }else{
            return res.status(503).json({message:"Something went worng with the server please try again"})
        }

    } catch (err) {
        console.log("the previous logic has failed to execute and error is ", err)
        return res.status(500).json({message:`${err}`})
    }
}