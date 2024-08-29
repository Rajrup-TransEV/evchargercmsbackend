import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt'; // Ensure bcrypt is installed for hashing passwords
import logging from "../../../logging/logging_generate.js";
const prisma = new PrismaClient();

const resetPasswordLogic = async (req, res) => {
  const apiauthkey = req.headers['apiauthkey'];
  // Check if the API key is valid
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      const messagetype = "error"
      const message = "API route access error"
      const filelocation = "adminmadeuserauth/resetPasswordlogic.js"
      logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
  try {
    const { email, newPassword } = req.body;
    if(!email || !newPassword){
      const messagetype = "error"
      const message = "No value provided for one or more fields."
      const filelocation = "adminmadeuserauth/resetPasswordlogic.js"
      logging(messagetype,message,filelocation)
      return res.status(400).json({ error: 'No value provided for one or more fields.' });
    }
    // Retrieve the user profile based on the email
    const user = await prisma.userProfile.findFirstOrThrow({
      where: {
        email: email,
      },
      select: {
        uid: true,
      },
    });

    // Check if user exists
    if (!user) {
      const messagetype = "error"
      const message = "No user found with this email."
      const filelocation = "adminmadeuserauth/resetPasswordlogic.js"
      logging(messagetype,message,filelocation)
      return res.status(404).json({ message: "No user found with this email." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await prisma.userProfile.update({
      where: {
        uid: user.uid,
      },
      data: {
        password: hashedPassword,
      },
    });
    const messagetype = "success"
    const message = "Password reset successfully."
    const filelocation = "adminmadeuserauth/resetPasswordlogic.js"
    logging(messagetype,message,filelocation)

    return res.status(200).json({ message: "Password reset successfully." });

  } catch (error) {
    console.log(error);
    const messagetype = "error"
    const message = `Error occurred ${error}`
    const filelocation = "adminmadeuserauth/resetPasswordlogic.js"
    logging(messagetype,message,filelocation)

    return res.status(500).json({ message: `Error occurred: ${error}` });
  }
};

export default resetPasswordLogic;
