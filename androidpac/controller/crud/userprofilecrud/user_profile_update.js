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

    const { uid, firstname, lastname, bio, address, phonenumber, userprofilepicture } = req.body;

    try {
        const userProfile = await prisma.appUserProfile.findFirstOrThrow({
            where: {
                uid: uid
            }
        });

        if (!userProfile) {
            const messagetype = "error";
            const message = "User profile data not found";
            const filelocation = "androidpac/user_profile_update.js";
            logging(messagetype, message, filelocation);
            return res.status(404).json({ error: "User profile data not found" });
        }

        const updateData = {};
        
        // Update fields conditionally
        if (firstname) updateData.firstname = firstname;
        if (lastname) updateData.lastname = lastname;
        if (bio) updateData.bio = bio;
        if (address) updateData.address = address;
        if (phonenumber) updateData.phonenumber = phonenumber;

        // Handle user profile picture upload
        let imageFilePath = null;
        let normalizepathch = null
        if (userprofilepicture) {
         
        const base64Data = userprofilepicture.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        console.log("buffer",buffer)
        const imageName = `${crypto.randomUUID()}.png`;
        imageFilePath = path.join('profilepicture', imageName);
            console.log("Image Name:", imageName);
            console.log("Image File Path:", imageFilePath);

            fs.writeFileSync(imageFilePath, buffer);
            updateData.profilepicture = imageFilePath.replace(/\\/g, '/'); // Store normalized path in the database
            normalizepathch = imageFilePath.replace(/\\/g, '/');
         console.log("normalazie path",normalizepathch)
         fs.writeFileSync(imageFilePath, buffer);
        }

        // Update the user profile in the database
        const updatedUserProfile = await prisma.appUserProfile.update({
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
        
        return res.status(500).json({ message: "Error occurred", error: error });
    }
};

export default userprofileupdate;
