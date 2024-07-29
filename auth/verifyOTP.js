import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

const verifyOTP = async (req, res) => {
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

        // Update the user's email verification status
        await prisma.user.update({
            where: {
                email: email
            },
            data: {
                emailVerified: true,
                otp: null,
                otpExpiration: null
            }
        });

        return res.status(200).json({ message: "Email verified successfully. proceed login" });
    } catch (err) {
        console.log("Error verifying OTP:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export default verifyOTP