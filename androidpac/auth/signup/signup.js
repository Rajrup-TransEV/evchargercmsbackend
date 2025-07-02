import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";
import generateOtp from "../../../lib/generateotp.js";
import generateCustomRandomUID from "../../../lib/customuids.js";
import create_wallet_details from "../../../admin/crud/wallet_crud/create_wallet_details.js";
import dotenv from "dotenv"
dotenv.config()
const prisma = new PrismaClient();

const tempStorage = {};
const ASSOCIATED_ADMINID=process.env.ASSOCIATED_ADMIN
export const signupUser = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        logging("error", "API route access forbidden", "androidpac/signup.js");
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { username, email, password, phonenumber, otp } = req.body;

    try {
        if (otp) {
            logging("info", `OTP verification initiated for email: ${email}`, "androidpac/signup.js");
            if (!tempStorage[email]) {
                logging("warn", `Session expired or invalid for email: ${email}`, "androidpac/signup.js");
                return res.status(400).json({ message: "Session expired or invalid. Please re-signup." });
            }

            const { otpExpiration, username: storedUsername, password: storedPassword } = tempStorage[email];

            if (Date.now() > otpExpiration) {
                logging("warn", `OTP expired for email: ${email}`, "androidpac/signup.js");
                delete tempStorage[email]; // Clean up expired session
                return res.status(400).json({ message: "Your session has expired. Please re-signup." });
            }

        
            if (otp !== tempStorage[email].otp) {
                logging("warn", `Invalid OTP provided for email: ${email}`, "androidpac/signup.js");
                return res.status(400).json({ message: "Invalid OTP. Please try again." });
            }

            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(storedPassword, salt);
            const useruid = generateCustomRandomUID()
            await prisma.user.create({
                data: {
                    uid: useruid,
                    username: storedUsername,
                    email,
                    password: hashedPassword,
                    userType: "user",
                    phonenumber,
                    emailVerified: true,
                    associatedadminid:ASSOCIATED_ADMINID
                }
            });

            logging("info", `User signup completed successfully for email: ${email}`, "androidpac/signup.js");
            await create_wallet_details(useruid)
            
            const { phonenumber: storedPhoneNumber } = tempStorage[email];
            
            const subject = "Thank you for signing up! Welcome to Transev app";
            const text = `
                Hello ${storedUsername}, welcome to the Transev Android application!

                Your credentials are:
                Email: ${email}
                Phone Number: ${storedPhoneNumber}

                Thank you for signing up!

                Best regards,
                Team Transev
            `;

            delete tempStorage[email];

            try {
                await emailQueue.add({ to: email, subject, text }, {
                    attempts: 5,
                    backoff: 10000
                });
            } catch (emailError) {
                logging("error", `Failed to send welcome email to ${email}: ${emailError.message}`, "androidpac/signup.js");
            }

            return res.status(201).json({ message: "Signup completed successfully!" });
        }

        logging("info", `Signup initiated for username: ${username}, email: ${email}`, "androidpac/signup.js");

        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { email: true, username: true }
        });

        if (existingUser) {
            logging("error", `User with the same email already exists for email: ${email}`, "androidpac/signup.js");
            return res.status(409).json({ message: "User with the same email already exists" });
        }

     
        const otpGenerated = generateOtp();
        
        tempStorage[email] = {
            uid: generateCustomRandomUID(),
            username,
            password,
            otp: otpGenerated,
            otpExpiration: Date.now() + 15 * 60 * 1000, 
            phonenumber 
        };

        
        const subject = 'Email Verification for Account Creation';
        const text = `Your OTP for email verification is: ${otpGenerated}. This OTP is only valid for 15 minutes.`;
        
        logging("info", `Adding email job to queue for sending OTP to ${email}`, "androidpac/signup.js");
        
        await emailQueue.add({ to: email, subject, text }, {
            attempts: 5,
            backoff: 10000
        });

        logging("info", `Signup initiated. An OTP has been sent to ${email} for verification.`, "androidpac/signup.js");
        return res.status(201).json({ message: "An OTP has been sent to your email for verification." });

    } catch (err) {
        console.error("The previous logic has failed to execute and error is ", err);
        
        logging("error", `Server error occurred during signup process - ${err.message}`, "androidpac/signup.js");
        
        return res.status(500).json({ message: "Something went wrong with the server. Please try again later." });
    }
}
