import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();
const tempStorage = {}; // Temporary storage for OTPs

export const passwordResetLogic = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        logging("error", "API route access error", "androidpac/passwordResetLogic.js");
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { email, otp, newPassword } = req.body;

    try {
        // Step 1: Request OTP
        if (email && !otp && !newPassword) {
            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { email },
                select: { uid: true, email: true },
            });

            if (!existingUser) {
                logging("error", "No user found with this email.", "androidpac/passwordResetLogic.js");
                return res.status(404).json({ message: "No user found with this email." });
            }

            // Generate a 6-digit OTP
            const otpGenerated = Math.floor(100000 + Math.random() * 900000).toString();

            // Store the generated OTP and expiration in temporary storage
            tempStorage[email] = {
                generatedOtp: otpGenerated,
                otpExpiration: Date.now() + 15 * 60 * 1000, // Set OTP expiration to 15 minutes from now
            };

            // Send the OTP via email
            const subject = 'OTP for Password Reset';
            const text = `Your OTP for password reset is: ${otpGenerated}`;

            console.log('Adding email job to queue:', { to: email, subject, text });

            await emailQueue.add({ to: email, subject, text }, {
                attempts: 5,
                backoff: 10000,
            });

            logging("success", "OTP sent to your email for password reset.", "androidpac/passwordResetLogic.js");

            return res.status(201).json({ message: "OTP sent to your email for password reset." });
        }

        // Step 2: Verify OTP and reset password
        if (otp && newPassword && email) {
            // Check if email exists in temporary storage
            if (!tempStorage[email]) {
                logging("error", "Session expired or invalid. Please request a new OTP.", "androidpac/passwordResetLogic.js");
                return res.status(400).json({ message: "Session expired or invalid. Please request a new OTP." });
            }

            const { otpExpiration, generatedOtp } = tempStorage[email];

            // Check if OTP is expired
            if (Date.now() > otpExpiration) {
                delete tempStorage[email]; // Clean up expired session
                logging("error", "OTP has expired.", "androidpac/passwordResetLogic.js");
                return res.status(400).json({ message: "OTP has expired." });
            }

            // Check if provided OTP matches
            if (otp !== generatedOtp) {
                logging("error", "Invalid OTP.", "androidpac/passwordResetLogic.js");
                return res.status(400).json({ message: "Invalid OTP." });
            }

            // Clear OTP after successful verification
            delete tempStorage[email];

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update the user's password in the database
            await prisma.user.update({
                where: { email },
                data: { password: hashedPassword },
            });

            logging("success", `Password reset successfully for email: ${email}`, "androidpac/passwordResetLogic.js");
            
            return res.status(200).json({ message: "Password reset successfully." });
        }

        // If neither condition is met, return an error
        logging("error", "Invalid request. Provide either an email to receive an OTP or both an OTP and a new password.", "androidpac/passwordResetLogic.js");
        return res.status(400).json({ message: "Invalid request. Provide either an email to receive an OTP or both an OTP and a new password." });

    } catch (err) {
        console.error(err);
        logging("error", `Error ${err}`, "androidpac/passwordResetLogic.js");
        return res.status(500).json({ message: "Internal server error.", error: err });
    }
};
