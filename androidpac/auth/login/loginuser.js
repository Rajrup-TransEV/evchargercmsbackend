import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

// Temporary storage for login sessions
const tempStorage = {};

export const loginUser = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    console.log("API key is for login user:", apiauthkey);

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "androidpac/loginuser.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { email, password, otp } = req.body;

    // Check for required fields
    if (!email || !password) {
        const messagetype = "error";
        const message = "Email and password are required.";
        const filelocation = "androidpac/loginuser.js";
        logging(messagetype, message, filelocation);
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // If OTP is provided, verify it
        if (otp) {
            // Check if email exists in temporary storage
            if (!tempStorage[email]) {
                const messagetype = "error";
                const message = "Session expired or invalid. Please log in again.";
                const filelocation = "androidpac/loginuser.js";
                logging(messagetype, message, filelocation);
                return res.status(400).json({ message: "Session expired or invalid. Please log in again." });
            }

            const { otpExpiration, generatedOtp } = tempStorage[email];

            // Check if OTP is expired
            if (Date.now() > otpExpiration) {
                delete tempStorage[email]; // Clean up expired session
                const messagetype = "error";
                const message = "OTP has expired.";
                const filelocation = "androidpac/loginuser.js";
                logging(messagetype, message, filelocation);
                return res.status(400).json({ message: "OTP has expired." });
            }

            // Check if provided OTP matches
            if (otp !== generatedOtp) {
                const messagetype = "error";
                const message = "Invalid OTP.";
                const filelocation = "androidpac/loginuser.js";
                logging(messagetype, message, filelocation);
                return res.status(400).json({ message: "Invalid OTP." });
            }

            // Clear OTP after successful verification
            delete tempStorage[email];

            // Proceed to check email and password after successful OTP verification
            const existingUser = await prisma.user.findUnique({
                where: { email: email },
                select: { username:true,email: true,uid:true,userType:true,password: true }
            });

            if (!existingUser) {
                const messagetype = "error";
                const message = "Credentials do not match.";
                const filelocation = "androidpac/loginuser.js";
                logging(messagetype, message, filelocation);
                return res.status(404).json({ message: "Credentials do not match." });
            }

            // Compare the password
            const checkPassword = await bcrypt.compare(password, existingUser.password);
            if (!checkPassword) {
                const messagetype = "error";
                const message = "Credentials do not match.";
                const filelocation = "androidpac/loginuser.js";
                logging(messagetype, message, filelocation);
                return res.status(404).json({ message: "Credentials do not match." });
            }

            // Generate a JWT token for successful login
            const token = jwt.sign(
                {
                    username: existingUser.username,
                    email: existingUser.email,
                    userid: existingUser.uid,
                    userType: existingUser.userType,
                },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );
    

            logging("success", `User logged in successfully for email: ${email}`, "androidpac/loginuser.js");
            return res.status(200).json({ message: "Login successful", token:token });
        }

        // If no OTP is provided, proceed with normal login and generate an OTP
        const existingUserForLogin = await prisma.user.findUnique({
            where: { email: email },
            select: { email: true, password: true }
        });

        if (!existingUserForLogin) {
            const messagetype = "error";
            const message = "Credentials do not match.";
            const filelocation = "androidpac/loginuser.js";
            logging(messagetype, message, filelocation);
            return res.status(404).json({ message: "Credentials do not match." });
        }

        // Compare the password
        const checkPasswordForLogin = await bcrypt.compare(password, existingUserForLogin.password);
        if (!checkPasswordForLogin) {
            const messagetype = "error";
            const message = "Credentials do not match.";
            const filelocation = "androidpac/loginuser.js";
            logging(messagetype, message, filelocation);
            return res.status(404).json({ message: "Credentials do not match." });
        }

        // Generate a 6-digit OTP
        const otpGenerated = Math.floor(100000 + Math.random() * 900000).toString();

        // Store the generated OTP and expiration in temporary storage
        tempStorage[email] = {
            generatedOtp: otpGenerated,
            otpExpiration: Date.now() + 15 * 60 * 1000 // Set OTP expiration to 15 minutes from now
        };

        // Send the OTP via email
        const subject= 'OTP for Two-Step Authentication';
        const text = `Your OTP for two-step authentication is: ${otpGenerated}`;

        console.log('Adding email job to queue:', { to: email, subject, text });

        await emailQueue.add({ to: email, subject, text }, {
            attempts: 5,
            backoff: 10000
        });

        const messagetypeSuccess = "success";
        const messageSuccess = "OTP sent to your email for two-step authentication.";
        const filelocationSuccess = "androidpac/loginuser.js";

        logging(messagetypeSuccess, messageSuccess, filelocationSuccess);

        return res.status(201).json({ message: messageSuccess });

    } catch (err) {
        console.error(err);

        const messagetypeError = "error";
        const messageError = `Error ${err.message}`;
        const filelocationError = "androidpac/loginuser.js";

        logging(messagetypeError, messageError, filelocationError);

        return res.status(500).json({ message: "Internal server error.", error: err.message });
    }
};
