import { PrismaClient } from "@prisma/client";
import fs from 'fs';
import path from 'path';
import logging from "../../../../logging/logging_generate.js";
import crypto from 'crypto'; // Ensure you import crypto for UUID generation

const prisma = new PrismaClient();

const userprofileupdate = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "androidpac/user_profile_update.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { uid, username, email, phonenumber, userprofilepicture } = req.body;

    try {
        // Find the user profile
        const userProfile = await prisma.user.findFirstOrThrow({
            where: { uid: uid }
        });

        // Prepare data for update
        const updateData = {};

        // Update fields conditionally
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (phonenumber) updateData.phonenumber = phonenumber;

        // Handle user profile picture upload
        if (userprofilepicture) {
            const base64Data = userprofilepicture.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            const imageName = `${crypto.randomUUID()}.png`;
            const imageFilePath = path.join('profilepicture', imageName);

            fs.writeFileSync(imageFilePath, buffer);
            updateData.profilepicture = imageFilePath.replace(/\\/g, '/'); // Store normalized path in the database
        }

        // Update the user profile in the database
        const updatedUserProfile = await prisma.user.update({
            where: { uid: uid },
            data: updateData
        });

        const messagetype = "update";
        const message = "Updated user profile data";
        const filelocation = "androidpac/user_profile_update.js";
        logging(messagetype, message, filelocation);
        
        return res.status(200).json({ message: "Updated user profile data", data: updatedUserProfile });
    } catch (error) {
        console.log(error);
        
        const messagetype = "update";
        const message = `Internal server error ${error}`;
        const filelocation = "androidpac/user_profile_update.js";
        logging(messagetype, message, filelocation);
        
        return res.status(500).json({ message: "Error occurred", error: error.message });
    }
};

export default userprofileupdate;
