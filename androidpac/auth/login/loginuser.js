import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();
const tempStorage = {};

export const loginUser = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    console.log("API key is for login user:", apiauthkey);

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        logging("error", "API route access error", "androidpac/loginuser.js");
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { email, password, otp } = req.body;
    //hardcoded value later on this gonna changed
    const adminuid = "yyyy"
    // Check for required fields
    if (!email || !password) {
        logging("error", "Email and password are required.", "androidpac/loginuser.js");
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // If OTP is provided, verify it
        if (otp) {
            // Check if email exists in temporary storage
            if (!tempStorage[email]) {
                logging("error", "Session expired or invalid. Please log in again.", "androidpac/loginuser.js");
                return res.status(400).json({ message: "Session expired or invalid. Please log in again." });
            }

            const { otpExpiration, generatedOtp } = tempStorage[email];

            // Check if OTP is expired
            if (Date.now() > otpExpiration) {
                delete tempStorage[email]; // Clean up expired session
                logging("error", "OTP has expired.", "androidpac/loginuser.js");
                return res.status(400).json({ message: "OTP has expired." });
            }

            // Check if provided OTP matches
            if (otp !== generatedOtp) {
                logging("error", "Invalid OTP.", "androidpac/loginuser.js");
                return res.status(400).json({ message: "Invalid OTP." });
            }

            // Clear OTP after successful verification
            delete tempStorage[email];

            // Proceed to check email and password after successful OTP verification
            const existingUser = await findUserByEmail(email);

            if (!existingUser) {
                logging("error", "Credentials do not match.", "androidpac/loginuser.js");
                return res.status(404).json({ message: "Credentials do not match." });
            }

            // Compare the password
            const checkPassword = await bcrypt.compare(password, existingUser.password);
            if (!checkPassword) {
                logging("error", "Credentials do not match.", "androidpac/loginuser.js");
                return res.status(404).json({ message: "Credentials do not match." });
            }

            // Generate a JWT token for successful login
            const token = jwt.sign(
                {
                    username: existingUser.firstname || existingUser.username,
                    email: existingUser.email,
                    userid: existingUser.uid,
                    userType: existingUser.role || existingUser.userType,
                    adminuid:adminuid
                },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            logging("success", `User logged in successfully for email: ${email}`, "androidpac/loginuser.js");
            return res.status(200).json({ message: "Login successful", token: token });
        }

        // If no OTP is provided, proceed with normal login and generate an OTP
        const existingUserForLogin = await findUserByEmail(email);

        if (!existingUserForLogin) {
            logging("error", "Credentials do not match.", "androidpac/loginuser.js");
            return res.status(404).json({ message: "Credentials do not match." });
        }

        // Compare the password
        const checkPasswordForLogin = await bcrypt.compare(password, existingUserForLogin.password);
        if (!checkPasswordForLogin) {
            logging("error", "Credentials do not match.", "androidpac/loginuser.js");
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

        logging("success", "OTP sent to your email for two-step authentication.", "androidpac/loginuser.js");

        return res.status(201).json({ message: "OTP sent to your email for two-step authentication." });

    } catch (err) {
        console.error(err);
        logging("error", `Error ${err}`, "androidpac/loginuser.js");
        return res.status(500).json({ message: "Internal server error.", error: err });
    }
};

// Helper function to find user by email in either User or UserProfile tables.
const findUserByEmail = async (email) => {
    let user = await prisma.user.findUnique({
        where: { email },
        select: { username:true,email: true,uid:true,userType:true,password: true }
    });

    if (!user) {
        user = await prisma.userProfile.findUnique({
            where: { email },
            select: { firstname:true,email:true,uid:true,password:true,role:true }
        });
    }

    return user;
};