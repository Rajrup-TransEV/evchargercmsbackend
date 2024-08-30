import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const delete_user_profile = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "delete_admin_made_users.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { uid, email, phonenumber } = req.body;
    if(uid===""|| email===""||phonenumber===""){
        const messagetype = "error";
        const message = "No value provided for one or more fields.";
        const filelocation = "delete_admin_made_users.js";
        logging(messagetype, message, filelocation);
        return res.status(400).json({ error: 'No value provided for one or more fields.' });
      }
   

    try {
        // Find the user profile using the unique identifier
        const userProfile = await prisma.userProfile.findFirst({
            where: {
                OR: [
                    { uid: uid },
                    { email: email },
                    { phonenumber: phonenumber }
                ]
            }
        });

        // If user profile is not found
        if (!userProfile) {
            const messagetype = "error";
            const message = "User data not found";
            const filelocation = "delete_admin_made_users.js";
            logging(messagetype, message, filelocation);
            return res.status(404).json({ message: "User data not found" });
        }

        // Delete the user profile using a unique identifier
        const deletedUser = await prisma.userProfile.delete({
            where: {
                uid: userProfile.uid // Use the unique `id` to delete the record
            }
        });

        const messagetype = "success";
        const message = "User associated data has been deleted";
        const filelocation = "delete_admin_made_users.js";
        logging(messagetype, message, filelocation);

        // Return a success message
        return res.status(200).json({ message: 'User associated data has been deleted' });

    } catch (error) {
        console.error('Error deleting user profile:', error);
        const messagetype = "error";
        const message = `An error occurred while deleting the user data :: ${error.message}`;
        const filelocation = "delete_admin_made_users.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({ message: `An error occurred while deleting the user data :: ${error.message}` });
    }
};

export default delete_user_profile;
