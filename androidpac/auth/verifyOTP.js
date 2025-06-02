import { PrismaClient } from "@prisma/client";
import logging from "../../logging/logging_generate.js";
const prisma = new PrismaClient()

const verifyOTP = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      const messagetype = "error"
      const message = "API route access forbidden"
      const filelocation = "androidpac/verifyOTP.js"
      logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
    const { email, otp } = req.body;

    try {
        if(!email===""||!otp===""){
            const messagetype = "error"
            const message = "Required fields must be given"
            const filelocation = "androidpac/verifyOTP.js"
            logging(messagetype,message,filelocation)
            return res.status(403).json({ message: "Required fields must be given" });
        }
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            const messagetype = "error"
            const message = "User not found"
            const filelocation = "androidpac/verifyOTP.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json({ message: "User not found." });
        }

        if (user.otp !== otp || new Date() > user.otpExpiration) {
            const messagetype = "error"
            const message = "Invalid or expired OTP."
            const filelocation = "androidpac/verifyOTP.js"
            logging(messagetype,message,filelocation)
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
        const messagetype = "success"
        const message = "Email verified successfully. proceed login"
        const filelocation = "androidpac/verifyOTP.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({ message: "Email verified successfully. proceed login" });
    } catch (err) {
        console.log("Error verifying OTP:", err);
        const messagetype = "success"
        const message = `Internal server error - error details ${err}`
        const filelocation = "androidpac/verifyOTP.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({ message: "Internal server error." });
    }
};

export default verifyOTP