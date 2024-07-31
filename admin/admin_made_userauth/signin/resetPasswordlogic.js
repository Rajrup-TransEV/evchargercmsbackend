import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt'; // Ensure bcrypt is installed for hashing passwords
const prisma = new PrismaClient();

const resetPasswordLogic = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

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

    return res.status(200).json({ message: "Password reset successfully." });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Error occurred: ${error}` });
  }
};

export default resetPasswordLogic;
