import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export const loginUser = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const { username, email, password } = req.body;

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
            return res.status(404).json({ message: "Wrong credentials" });
        }

        const checkPassword = await bcrypt.compare(
            password,
            existingUser.password
        );
        if (!checkPassword) {
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

        // Create a transporter for Nodemailer using Outlook
        const transporter = nodemailer.createTransport({
            service: 'Outlook365',
            auth: {
                user: process.env.OUTLOOK_EMAIL,
                pass: process.env.OUTLOOK_PASS
            }
        });

        // Define the email options
        const mailOptions = {
            from: process.env.OUTLOOK_EMAIL,
            to: email,
            subject: 'OTP for Two-Step Authentication',
            text: `Your OTP for two-step authentication is: ${otp}`
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        return res.status(201).json({ message: "OTP sent to your email for two-step authentication." });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error." });
    }
};
