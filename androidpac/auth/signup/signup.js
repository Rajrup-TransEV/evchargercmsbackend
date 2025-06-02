import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";
import generateOtp from "../../../lib/generateotp.js";
import generateCustomRandomUID from "../../../lib/customuids.js";

const prisma = new PrismaClient();

// Temporary storage for signups
const tempStorage = {};

export const signupUser = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        logging("error", "API route access forbidden", "androidpac/signup.js");
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { username, email, password, phonenumber, otp } = req.body;

    try {
        // If OTP is provided, we are in the verification phase
        if (otp) {
            logging("info", `OTP verification initiated for email: ${email}`, "androidpac/signup.js");

            // Check if email exists in temporary storage
            if (!tempStorage[email]) {
                logging("warn", `Session expired or invalid for email: ${email}`, "androidpac/signup.js");
                return res.status(400).json({ message: "Session expired or invalid. Please re-signup." });
            }

            const { otpExpiration, username: storedUsername, password: storedPassword } = tempStorage[email];

            // Check if OTP is expired
            if (Date.now() > otpExpiration) {
                logging("warn", `OTP expired for email: ${email}`, "androidpac/signup.js");
                delete tempStorage[email]; // Clean up expired session
                return res.status(400).json({ message: "Your session has expired. Please re-signup." });
            }

            // Check if provided OTP matches
            if (otp !== tempStorage[email].otp) {
                logging("warn", `Invalid OTP provided for email: ${email}`, "androidpac/signup.js");
                return res.status(400).json({ message: "Invalid OTP. Please try again." });
            }

            // Hash password and store user in database
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(storedPassword, salt);

            await prisma.user.create({
                data: {
                    uid: generateCustomRandomUID(),
                    username: storedUsername,
                    email,
                    password: hashedPassword,
                    userType: "user",
                    phonenumber,
                    emailVerified: true
                }
            });

            logging("info", `User signup completed successfully for email: ${email}`, "androidpac/signup.js");
            
            // Prepare and send welcome email using data from temp storage
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

            // Cleanup temporary storage after successful signup
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

        // If OTP is not provided, we are in the signup phase
        logging("info", `Signup initiated for username: ${username}, email: ${email}`, "androidpac/signup.js");

        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { email: true, username: true }
        });

        if (existingUser) {
            logging("error", `User with the same email already exists for email: ${email}`, "androidpac/signup.js");
            return res.status(409).json({ message: "User with the same email already exists" });
        }

        // Generate OTP and store it in temporary storage
        const otpGenerated = generateOtp();
        
        tempStorage[email] = {
            uid: generateCustomRandomUID(),
            username,
            password,
            otp: otpGenerated,
            otpExpiration: Date.now() + 15 * 60 * 1000, // 15 minutes from now,
            phonenumber // Store phone number as well in temporary storage.
        };

        // Send OTP via email
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
