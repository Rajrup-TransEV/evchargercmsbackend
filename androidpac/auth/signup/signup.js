//signup logic for normal user
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../lib/customuids.js";
import generateOtp from "../../../lib/generateotp.js";

const prisma = new PrismaClient()

export const signupUser = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
      // Check if the API key is valid
      if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access forbidden"
        const filelocation = "androidpac/signup.js"
        logging(messagetype,message,filelocation)
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
            const messagetype = "error"
            const message = "User with the same email or username already exists"
            const filelocation =  "androidpac/signup.js"
            logging(messagetype,message,filelocation)
            return res.status(409).json({message:"User with the same email or username already exists"})
        }
        const salt = await bcrypt.genSalt(10); // Await the salt generation
        const hashedPassword = await bcrypt.hash(password, salt); // Await the hashing
        const uuid = generateCustomRandomUID()
        //opt verification process has start here 
        const otp = generateOtp();
        const to = email
        const subject = 'Email Verification for Account Creation'
        const text =  `Your OTP for email verification is: ${otp}   ::: this otp only valid for 15 minutes`
     
    // Add the email job to the queue
    console.log('Adding email job to queue:', { to, subject, text });
    await emailQueue.add({ to, subject, text }, {
        attempts: 5, // Number of retry attempts
        backoff: 10000 // Wait 10 seconds before retrying
    });

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
            const messagetype = "success"
            const message = "An OTP has been sent to your email for verification. Please enter the OTP to complete the signup process."
            const filelocation =  "androidpac/signup.js"
            logging(messagetype,message,filelocation)
           return res.status(201).json({ message: "An OTP has been sent to your email for verification. Please enter the OTP to complete the signup process.", user: email });
        }else{
            const messagetype = "error"
            const message = "Something went worng with the server please try again"
            const filelocation =  "androidpac/signup.js"
            logging(messagetype,message,filelocation)
            return res.status(503).json({message:"Something went worng with the server please try again"})
        }

    } catch (err) {
        console.log("the previous logic has failed to execute and error is ", err)
        const messagetype = "error"
        const message = `Something went worng with the server please try again - ${err}`
        const filelocation =  "androidpac/signup.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({message:`${err}`})
    }
}