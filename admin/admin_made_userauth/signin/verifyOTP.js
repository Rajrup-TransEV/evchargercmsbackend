import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
const prisma = new PrismaClient();

const verifyOtpLogic = async (req, res) => {
  const apiauthkey = req.headers['apiauthkey'];
  // Check if the API key is valid
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      const messagetype = "error"
      const message = "API route access error"
      const filelocation = "adminmadeuserauth/verifyOTP.js"
      logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
  try {
    const { email, otp } = req.body;
    if(!email || !otp){
      const messagetype = "error"
      const message = "No value provided for one or more fields."
      const filelocation = "adminmadeuserauth/verifyOTP.js"
      logging(messagetype,message,filelocation)
      return res.status(400).json({ error: 'No value provided for one or more fields.' });
    }
    // Retrieve the user profile based on the email
    const user = await prisma.userProfile.findFirstOrThrow({
      where: {
        email:email
      },
      select: {
        uid: true,
        otp: true,
        otpExpiration: true,
      },
    });

    // Check if user exists
    if (!user) {
      const messagetype = "error"
      const message = "No user found with this email."
      const filelocation = "adminmadeuserauth/verifyOTP.js"
      logging(messagetype,message,filelocation)
      return res.status(404).json({ message: "No user found with this email." });
    }

    // Check if OTP matches and is not expired
    const isOtpValid = user.otp === otp;
    const isOtpExpired = user.otpExpiration < new Date();

    if (!isOtpValid) {
      const messagetype = "error"
      const message = "Invalid OTP."
      const filelocation = "adminmadeuserauth/verifyOTP.js"
      logging(messagetype,message,filelocation)
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (isOtpExpired) {
      const messagetype = "error"
      const message = "OTP has expired. Please request a new one."
      const filelocation = "adminmadeuserauth/verifyOTP.js"
      logging(messagetype,message,filelocation)
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }
    const messagetype = "success"
      const message = "OTP verified successfully. You can now reset your password."
      const filelocation = "adminmadeuserauth/verifyOTP.js"
      logging(messagetype,message,filelocation)
    // OTP is valid and not expired; you can proceed with password reset logic here
    return res.status(200).json({ message: "OTP verified successfully. You can now reset your password." });

  } catch (error) {
    console.log(error);
    const messagetype = "success"
    const message = `Some error occurred ${error}`
    const filelocation = "adminmadeuserauth/verifyOTP.js"
    logging(messagetype,message,filelocation)
    return res.status(500).json({ message: `Error occurred: ${error}` });
  }
};

export default verifyOtpLogic;
