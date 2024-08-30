import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const update_user_role_details = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "update_a_role_details.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    try {
        const { id, userid, uid, rolename, roledesc } = req.body;
        if(userid==="" || uid===""|| rolename===""||roledesc===""){
            const messagetype = "error";
            const message = "fields cannot be empty";
            const filelocation = "update_a_role_details.js";
            logging(messagetype, message, filelocation);
            return res.status(400).json("fields cannot be empty")
        }
        // Create an object to hold the updated data
        const updateData = {};

        // Only add fields that are provided in the request body
        if (rolename) updateData.rolename = rolename;
        if (roledesc) updateData.roledesc = roledesc;

        // Ensure that at least one field is provided for the update
        if (Object.keys(updateData).length === 0) {
            const messagetype = "error";
            const message = "No fields provided for update";
            const filelocation = "update_a_role_details.js";
            logging(messagetype, message, filelocation);
            return res.status(400).json({ error: 'No fields provided for update' });
        }

        // Ensure at least one identifier is provided
        if (!uid && !userid) {
            const messagetype = "error";
            const message = "Either uid or userid must be provided";
            const filelocation = "update_a_role_details.js";
            logging(messagetype, message, filelocation);
            return res.status(400).json({ error: 'Either uid or userid must be provided' });
        }

        // Update the user role assignment
        const updatedRole = await prisma.assignRoles.update({
            where: {
                // Use uid if it's provided, otherwise use userid
                ...(uid ? { uid: uid } : {}),
                ...(userid ? { userid: userid } : {})
            },
            data: updateData // Use the object with only the updated fields
        });

        const messagetype = "success";
        const message = "All fields have been updated";
        const filelocation = "update_a_role_details.js";
        logging(messagetype, message, filelocation);

        // Return the updated role details
        return res.status(200).json({ message: updatedRole });
    } catch (error) {
        console.error('Error updating user role details:', error);
        const messagetype = "error";
        const message = "An error occurred while updating user role details";
        const filelocation = "update_a_role_details.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({ error: 'An error occurred while updating user role details' });
    }
};

export default update_user_role_details;
