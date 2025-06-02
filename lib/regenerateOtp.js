import { PrismaClient } from "@prisma/client";
import logging from "../logging/logging_generate.js";
import emailQueue from "./emailqueue.js";
import generateOtp from "./generateotp.js";

const prisma = new PrismaClient();

const regenerateOtp = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access forbidden";
        const filelocation = "androidpac/regenerateOtp.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { email } = req.body;

    try {
        if (!email) {
            const messagetype = "error";
            const message = "Email is required.";
            const filelocation = "androidpac/regenerateOtp.js";
            logging(messagetype, message, filelocation);
            return res.status(400).json({ message: "Email is required." });
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            const messagetype = "error";
            const message = "User not found.";
            const filelocation = "androidpac/regenerateOtp.js";
            logging(messagetype, message, filelocation);
            return res.status(404).json({ message: "User not found." });
        }

        // Generate a new OTP
        const newOtp = generateOtp();
        const subject = 'New OTP for Email Verification';
        const text = `Your new OTP for email verification is: ${newOtp}. This OTP is valid for 15 minutes.`;

        // Send the new OTP via email
        await emailQueue.add({ to: email, subject, text }, {
            attempts: 5,
            backoff: 10000 // Wait 10 seconds before retrying
        });

        // Update user with new OTP and expiration time
        await prisma.user.update({
            where: { email: email },
            data: {
                otp: newOtp,
                otpExpiration: new Date(Date.now() + 15 * 60 * 1000) // Set new expiration time
            }
        });

        const messagetype = "success";
        const message = "A new OTP has been sent to your email.";
        const filelocation = "androidpac/regenerateOtp.js";
        logging(messagetype, message, filelocation);
        
        return res.status(200).json({ message: "A new OTP has been sent to your email." });
        
    } catch (err) {
        console.log("Error regenerating OTP:", err);
        const messagetype = "error";
        const message = `Internal server error - error details ${err}`;
        const filelocation = "androidpac/regenerateOtp.js";
        logging(messagetype, message, filelocation);
        
        return res.status(500).json({ message: "Internal server error." });
    }
};

export default regenerateOtp;
