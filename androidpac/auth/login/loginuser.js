import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

export const loginUser = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    console.log("apikey is for login user",apiauthkey)
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "androidpac/loginuser.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const { username, email, password } = req.body;
    if(username===""||email===""||password===""){
        const messagetype = "error"
        const message = "Required fields needs to given"
        const filelocation = "androidpac/loginuser.js"
        logging(messagetype,message,filelocation)
        return res.status(400).json({message:"Required fields needs to given"})
    }
    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email,
                username: username
            },
            select: {
                email: true,
                username: true,
                uid: true,
                password: true,
                userType: true,
                emailVerified: true
            }
        });
        if (!existingUser) {
            const messagetype = "error"
            const message = "Wrong credentials"
            const filelocation = "androidpac/loginuser.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json({ message: "Wrong credentials" });
        }

        const checkPassword = await bcrypt.compare(
            password,
            existingUser.password
        );
        if (!checkPassword) {
            const messagetype = "error"
            const message = "Password does not match. Failed to login."
            const filelocation = "androidpac/loginuser.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json({ message: "Password does not match. Failed to login." });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Update the user's OTP and expiration in the database
        await prisma.user.update({
            where: {
                email: email
            },
            data: {
                otp: otp,
                otpExpiration: new Date(Date.now() + 15 * 60 * 1000) // Set OTP expiration to 15 minutes from now
            }
        });

            const to = email
            const subject= 'OTP for Two-Step Authentication'
            const text = `Your OTP for two-step authentication is: ${otp}`
              // Add the email job to the queue
              console.log('Adding email job to queue:', { to, subject, text });
              await emailQueue.add({ to, subject, text }, {
                  attempts: 5, // Number of retry attempts
                  backoff: 10000 // Wait 10 seconds before retrying
              });
              const messagetype = "success"
              const message = "OTP sent to your email for two-step authentication."
              const filelocation = "androidpac/loginuser.js"
              logging(messagetype,message,filelocation)
        return res.status(201).json({ message: "OTP sent to your email for two-step authentication." });
    } catch (err) {
        console.log(err);
        const messagetype = "error"
        const message = `Error ${err}`
        const filelocation = "androidpac/loginuser.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({ message: "Internal server error." ,error:err});
    }
};
