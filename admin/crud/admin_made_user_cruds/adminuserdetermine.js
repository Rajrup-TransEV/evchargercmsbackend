import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const determineuser = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "update_admin_made_users.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { uid } = req.body;

    try {
        const userprofile = await prisma.userProfile.findFirst({
            where: { uid: uid }
        });

        const user = await prisma.user.findFirst({
            where: { uid: uid }
        });

        const response = {
            userProfileExists: userprofile ? "yes" : "no",
            userExists: user ? "yes" : "no"
        };

        const messagetype = "success";
        const message = "Requested data has been fetched successfully";
        const filelocation = "adminuserdetermine.js";
        logging(messagetype, message, filelocation);

        return res.status(200).json(response);

    } catch (error) {
        console.log(error);
        const messagetype = "error";
        const message = "Something went wrong";
        const filelocation = "adminuserdetermine.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({ error: error.message });
    }
};

export default determineuser;