import { PrismaClient } from "@prisma/client";
import emailQueue from "../../../lib/emailqueue.js";
const prisma = new PrismaClient();

const passwordresetlogic = async (req, res) => {
  try {
    const { getuseremail } = req.body;
    const user_password_reset = await prisma.userProfile.findFirstOrThrow({
      where: {
        email: getuseremail,
      },
      select: {
        id: true,
        firstname: true,
        email: true,
      },
    });

    if (!user_password_reset) {
      return res.status(404).json({ message: "No user data found associated with the email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    const otpExpiration = new Date(Date.now() + 15 * 60 * 1000); // OTP expires in 15 minutes

    await prisma.userProfile.update({
      where: {
        id: user_password_reset.id,
      },
      data: {
        otp: otp,
        otpExpiration: otpExpiration,
      },
    });

    const to = user_password_reset.email;
    const subject = `Hello ${user_password_reset.firstname}, You have requested a password reset`;
    const text = `Your OTP for verification is: ${otp}. This OTP will expire in 15 minutes.`;

    // Add the email job to the queue
    console.log('Adding email job to queue:', { to, subject, text });
    await emailQueue.add({ to, subject, text }, {
      attempts: 5, // Number of retry attempts
      backoff: 10000, // Wait 10 seconds before retrying
    });

    return res.status(200).json({ message: "A verification email has been sent via email" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Error occurred: ${error}` });
  }
};

export default passwordresetlogic;
