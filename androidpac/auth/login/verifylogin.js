// verify login with otp process defined here
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import jwt from "jsonwebtoken";
const verifyloginOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.otp !== otp || new Date() > user.otpExpiration) {
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

        return res.status(200).json({ message: "Login successful", authtoken: token });
    } catch (err) {
        console.log("Error verifying OTP:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export default verifyloginOTP