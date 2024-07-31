import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const verifyOtpLogic = async (req, res) => {
  try {
    const { email, otp } = req.body;
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
      return res.status(404).json({ message: "No user found with this email." });
    }

    // Check if OTP matches and is not expired
    const isOtpValid = user.otp === otp;
    const isOtpExpired = user.otpExpiration < new Date();

    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (isOtpExpired) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // OTP is valid and not expired; you can proceed with password reset logic here
    return res.status(200).json({ message: "OTP verified successfully. You can now reset your password." });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Error occurred: ${error}` });
  }
};

export default verifyOtpLogic;
