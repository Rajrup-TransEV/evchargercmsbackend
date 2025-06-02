import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import path from 'path'; // Ensure you import path
import fs from 'fs'; // Ensure you import fs
import { getCache, setCache } from "../../../../utils/cacheops.js"; // Import setCache

const prisma = new PrismaClient();

const getalluserprofile = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "androidpac/user_profile_get_all.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    try {
        // Fetch all user data from the database
        const getalldata = await prisma.user.findMany({
            select: {
                uid: true,
                username: true,
                email: true,
                phonenumber: true,
                profilepicture: true
            }
        });

        // Check if data is found
        if (!getalldata || getalldata.length === 0) {
            const messagetype = "error";
            const message = "Data not found";
            const filelocation = "androidpac/user_profile_get_all.js";
            logging(messagetype, message, filelocation);
            return res.status(404).json({ message: "Data not found" });
        }

        // Process each user's profile picture and prepare response
        const userProfilesWithImages = await Promise.all(getalldata.map(async (user) => {
            let profileImageDataUrl = null;

            if (user.profilepicture) {
                const chfilepath = path.resolve(user.profilepicture); // Resolve the path for each user
                try {
                    const fileBuffer = fs.readFileSync(chfilepath);
                    const base64Image = fileBuffer.toString('base64');
                    profileImageDataUrl = `data:image/png;base64,${base64Image}`;
                } catch (err) {
                    console.error(`Error reading image for user ${user.uid}:`, err);
                }
            }

            // Return user data including the base64 image URL
            return {
                ...user,
                profilepicture: profileImageDataUrl
            };
        }));

        // Store the fetched data in cache for future requests
        // await setCache("all_app_user_data", userProfilesWithImages);

        return res.status(200).json({ message: "All of the data", userprofile: userProfilesWithImages });
    } catch (error) {
        console.error("Error occurred:", error); // Log the error for debugging
        return res.status(500).json({ message: "Error occurred", data: error });
    }
}

export default getalluserprofile;
