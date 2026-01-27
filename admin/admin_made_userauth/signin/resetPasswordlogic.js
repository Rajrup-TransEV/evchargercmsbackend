// import { PrismaClient } from "@prisma/client";
// import bcrypt from 'bcrypt'; // Ensure bcrypt is installed for hashing passwords
// import logging from "../../../logging/logging_generate.js";
// const prisma = new PrismaClient();

// const resetPasswordLogic = async (req, res) => {
//   const apiauthkey = req.headers['apiauthkey'];
//   // Check if the API key is valid
//   if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
//       const messagetype = "error"
//       const message = "API route access error"
//       const filelocation = "adminmadeuserauth/resetPasswordlogic.js"
//       logging(messagetype,message,filelocation)
//       return res.status(403).json({ message: "API route access forbidden" });
//   }
//   try {
//     const { email, newPassword } = req.body;
//     if(email==="" || newPassword===""){
//       const messagetype = "error"
//       const message = "No value provided for one or more fields."
//       const filelocation = "adminmadeuserauth/resetPasswordlogic.js"
//       logging(messagetype,message,filelocation)
//       return res.status(400).json({ error: 'No value provided for one or more fields.' });
//     }
//     // Retrieve the user profile based on the email
//     const user = await prisma.userProfile.findFirstOrThrow({
//       where: {
//         email: email,
//       },
//       select: {
//         uid: true,
//       },
//     });

//     // Check if user exists
//     if (!user) {
//       const messagetype = "error"
//       const message = "No user found with this email."
//       const filelocation = "adminmadeuserauth/resetPasswordlogic.js"
//       logging(messagetype,message,filelocation)
//       return res.status(404).json({ message: "No user found with this email." });
//     }

//     // Hash the new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // Update the user's password in the database
//     await prisma.userProfile.update({
//       where: {
//         uid: user.uid,
//       },
//       data: {
//         password: hashedPassword,
//       },
//     });
//     const messagetype = "success"
//     const message = "Password reset successfully."
//     const filelocation = "adminmadeuserauth/resetPasswordlogic.js"
//     logging(messagetype,message,filelocation)

//     return res.status(200).json({ message: "Password reset successfully." });

//   } catch (error) {
//     console.log(error);
//     const messagetype = "error"
//     const message = `Error occurred ${error}`
//     const filelocation = "adminmadeuserauth/resetPasswordlogic.js"
//     logging(messagetype,message,filelocation)

//     return res.status(500).json({ message: `Error occurred: ${error}` });
//   }
// };

// export default resetPasswordLogic;

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

function denyApi(req, res, filelocation) {
  const apiauthkey = req.headers["apiauthkey"];
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    logging("error", "API route access error", filelocation);
    return res.status(403).json({ message: "API route access forbidden" });
  }
  return null;
}

// timing-safe compare for OTP strings
function safeEqual(a, b) {
  const aa = Buffer.from(String(a ?? ""), "utf8");
  const bb = Buffer.from(String(b ?? ""), "utf8");
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

const resetPasswordLogic = async (req, res) => {
  const filelocation = "adminmadeuserauth/resetPasswordlogic.js";
  const denied = denyApi(req, res, filelocation);
  if (denied) return;

  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const otp = String(req.body?.otp ?? "").trim();
    const newPassword = String(req.body?.newPassword ?? "");

    if (!email || !otp || !newPassword.trim()) {
      logging("error", "Missing email/otp/newPassword", filelocation);
      return res
        .status(400)
        .json({ message: "email, otp, and newPassword are required." });
    }

    // Basic sanity (keep it minimal if you want)
    if (newPassword.length < 8) {
      logging("error", "Password too short", filelocation);
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
    }

    const user = await prisma.userProfile.findFirst({
      where: { email },
      select: {
        uid: true,
        otp: true,
        otpExpiration: true,
      },
    });

    if (!user) {
      logging("error", "No user found with this email.", filelocation);
      return res.status(404).json({ message: "No user found with this email." });
    }

    // OTP must exist and have expiry
    if (!user.otp || !user.otpExpiration) {
      logging("error", "OTP not requested or missing.", filelocation);
      return res.status(400).json({ message: "OTP not requested or invalid." });
    }

    // Expiry check
    const now = new Date();
    if (user.otpExpiration.getTime() < now.getTime()) {
      logging("error", "OTP has expired.", filelocation);
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    // Validate OTP
    if (!safeEqual(user.otp, otp)) {
      logging("error", "Invalid OTP.", filelocation);
      return res.status(400).json({ message: "Invalid OTP." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password + invalidate OTP so it can't be reused
    await prisma.userProfile.update({
      where: { uid: user.uid },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiration: null,
      },
    });

    logging("success", "Password reset successfully.", filelocation);
    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.log(error);
    logging(
      "error",
      `Error occurred: ${String(error?.message ?? error)}`,
      filelocation
    );
    return res.status(500).json({ message: "Internal server error." });
  }
};

export default resetPasswordLogic;

