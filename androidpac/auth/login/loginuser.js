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

    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        logging("error", "API route access error", "androidpac/loginuser.js");
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { email, password, otp } = req.body;
    const adminuid = "yyyy"
    if (!email || !password) {
        logging("error", "Email and password are required.", "androidpac/loginuser.js");
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        if (otp) {
            if (!tempStorage[email]) {
                logging("error", "Session expired or invalid. Please log in again.", "androidpac/loginuser.js");
                return res.status(400).json({ message: "Session expired or invalid. Please log in again." });
            }

            const { otpExpiration, generatedOtp } = tempStorage[email];

            if (Date.now() > otpExpiration) {
                delete tempStorage[email];
                logging("error", "OTP has expired.", "androidpac/loginuser.js");
                return res.status(400).json({ message: "OTP has expired." });
            }

            if (otp !== generatedOtp) {
                logging("error", "Invalid OTP.", "androidpac/loginuser.js");
                return res.status(400).json({ message: "Invalid OTP." });
            }

            delete tempStorage[email];

            const existingUser = await findUserByEmail(email);

            if (!existingUser) {
                logging("error", "Credentials do not match.", "androidpac/loginuser.js");
                return res.status(404).json({ message: "Credentials do not match." });
            }

           
            const checkPassword = await bcrypt.compare(password, existingUser.password);
            if (!checkPassword) {
                logging("error", "Credentials do not match.", "androidpac/loginuser.js");
                return res.status(404).json({ message: "Credentials do not match." });
            }

            const userwalletdetails = await prisma.wallet.findFirstOrThrow({
                where: { appuserrelatedwallet: existingUser.uid },
                select: { uid:true }
            });
            console.log(userwalletdetails)
            const token = jwt.sign(
                {
                    username: existingUser.firstname || existingUser.username,
                    email: existingUser.email,
                    userid: existingUser.uid,
                    userType: existingUser.role || existingUser.userType,
                    adminuid:adminuid,
                    userwalletid:userwalletdetails.uid
                },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            logging("success", `User logged in successfully for email: ${email}`, "androidpac/loginuser.js");
            return res.status(200).json({ message: "Login successful", token: token });
        }

        const existingUserForLogin = await findUserByEmail(email);

        if (!existingUserForLogin) {
            logging("error", "Credentials do not match.", "androidpac/loginuser.js");
            return res.status(404).json({ message: "Credentials do not match." });
        }

        const checkPasswordForLogin = await bcrypt.compare(password, existingUserForLogin.password);
        if (!checkPasswordForLogin) {
            logging("error", "Credentials do not match.", "androidpac/loginuser.js");
            return res.status(404).json({ message: "Credentials do not match." });
        }

        const otpGenerated = Math.floor(100000 + Math.random() * 900000).toString();

        tempStorage[email] = {
            generatedOtp: otpGenerated,
            otpExpiration: Date.now() + 15 * 60 * 1000 
        };
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