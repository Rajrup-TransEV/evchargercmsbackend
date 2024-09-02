// verify login with otp process defined here
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import jwt from "jsonwebtoken";
import logging from "../../../logging/logging_generate.js";
const verifyloginOTP = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "androidpac/verifylogin.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const { email, otp } = req.body;

    try {
        if(email===""||otp===""){
            const messagetype = "error"
            const message = "Required fields must be given"
            const filelocation = "androidpac/verifylogin.js"
            logging(messagetype,message,filelocation)
            return res.status(400).json({message:"Required fields must be given"})
        }
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            const messagetype = "error"
            const message = "User not found."
            const filelocation = "androidpac/verifylogin.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json({ message: "User not found." });
        }

        if (user.otp !== otp || new Date() > user.otpExpiration) {
            const messagetype = "error"
            const message = "Invalid or expired OTP."
            const filelocation = "androidpac/verifylogin.js"
            logging(messagetype,message,filelocation)
            return res.status(401).json({ message: "Invalid or expired OTP." });
        }

        // Generate the JWT token
        const token = jwt.sign(
            {
                username: user.username,
                email: user.email,
                userid: user.uid,
                userType: user.userType,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Clear the OTP and expiration from the database
        await prisma.user.update({
            where: {
                email: email
            },
            data: {
                otp: null,
                otpExpiration: null
            }
        });
        const messagetype = "error"
        const message = "Invalid or expired OTP."
        const filelocation = "androidpac/verifylogin.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({ message: "Login successful", authtoken: token });
    } catch (err) {
        console.log("Error verifying OTP:", err);
        const messagetype = "error"
        const message = `Internal server error occurred - details - ${err}`
        const filelocation = "androidpac/verifylogin.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({ message: "Internal server error." });
    }
};

export default verifyloginOTP