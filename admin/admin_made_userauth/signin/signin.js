//admin made user login routes
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const prisma = new PrismaClient()

const adminuserlogin = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { phone, email, password } = req.body;

    try {
        const existingUser = await prisma.userProfile.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phonenumber: phone }
                ]
            },
            select: {
                email: true,
                phonenumber: true,
                uid: true,
                password: true,
                role: true
            }
        });

        if (!existingUser) {
            return res.status(404).json({ message: "Wrong credentials" });
        }

        const checkPassword = await bcrypt.compare(password, existingUser.password);

        if (!checkPassword) {
            return res.status(404).json({ message: "Password does not match. Failed to login" });
        }

        const token = jwt.sign(
            {
                email: existingUser.email,
                userid: existingUser.uid,
                userType: existingUser.role,
            },
            process.env.JWT_SECRET, // Make sure to set your JWT secret in environment variables
            { expiresIn: '1h' } // Token expiration time
        );

        return res.status(201).json({ message: "Login success", authtoken: token });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export  default adminuserlogin