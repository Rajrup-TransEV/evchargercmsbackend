//admin made user login routes
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import logging from "../../../logging/logging_generate.js";
const prisma = new PrismaClient()

const adminuserlogin = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "adminmadeuserauth/signin.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }

    // const { phone, email, password } = req.body;
    // if ((email==="" && password==="") || (phone==="" && password==="")) {
    //     const messagetype = "error"
    //     const message = "No value provided for one or more fields."
    //     const filelocation = "adminmadeuserauth/signin.js"
    //     logging(messagetype,message,filelocation)
    //     return res.status(400).json({ error: 'No value provided for one or more fields.' });
    // }

    const { phone, email, password } = req.body;

    // normalize (optional but recommended)
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    const cleanPassword = typeof password === "string" ? password : "";

    // enforce: (email OR phone) AND password
    if ((!cleanEmail && !cleanPhone) || !cleanPassword) {
    return res.status(400).json({ message: "email or phone and password are required" });
    }

    // Build OR only from provided identifiers (NO undefined)
    const or = [];
    if (cleanEmail) or.push({ email: cleanEmail });
    if (cleanPhone) or.push({ phonenumber: cleanPhone });

    try {
        const existingUser = await prisma.userProfile.findFirst({
            where: {
                OR: or
            },
            select: {
                firstname:true,
                lastname:true,
                email: true,
                phonenumber: true,
                uid: true,
                password: true,
                role: true
            }
        });

        if (!existingUser) {
            const messagetype = "error"
            const message = "Wrong credentials"
            const filelocation = "adminmadeuserauth/signin.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json({ message: "Wrong credentials" });
        }

        const checkPassword = await bcrypt.compare(password, existingUser.password);

        if (!checkPassword) {
            const messagetype = "error"
            const message = "Password does not match. Failed to login"
            const filelocation = "adminmadeuserauth/signin.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json({ message: "Password does not match. Failed to login" });
        }

        const token = jwt.sign(
            {
                firstname:existingUser.firstname,
                lastname:existingUser.lastname,
                email: existingUser.email,
                adminid: existingUser.uid,
                userType: existingUser.role,
            },
            process.env.JWT_SECRET, // Make sure to set your JWT secret in environment variables
            { expiresIn: '5h' } // Token expiration time
        );
        const messagetype = "success"
        const message = "login success for admin profile user"
        const filelocation = "adminmadeuserauth/signin.js"
        logging(messagetype,message,filelocation)
        return res.status(201).json({ message: "Login success", authtoken: token });
    } catch (error) {
        console.log(error);
        const messagetype = "error"
        const message = `error occurred ${error}`
        const filelocation = "adminmadeuserauth/signin.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({ message: "Internal server error",error:error });
    }
};
export  default adminuserlogin