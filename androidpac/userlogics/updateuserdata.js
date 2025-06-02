//normal user update data
import { Prisma, PrismaClient } from "@prisma/client";
import logging from "../../logging/logging_generate.js";

const prisma = new PrismaClient();

const normaluserupdate = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "updateuserdata.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { userid, username,email,password,userType } = req.body;

    try {
        // Find the user by uid
        const user = await prisma.user.findFirstOrThrow({
            where: {
                uid: userid
            }
        });

        // Prepare update object
        const updateData = {};

        // Check which fields are provided in the updates and add them to the updateData object
        if (username) {
            updateData.username = username;
        }
        if (email) {
            updateData.email = email;
        }
        if (password) {
            updateData.password = password; // Consider hashing the password before saving
        }
        if (userType) {
            updateData.userType = userType;
        }

        // Update the user with the provided fields
        const updatedUser = await prisma.user.update({
            where: {
                uid: userid
            },
            data: updateData
        });

        return res.status(200).json({ message: "User updated successfully", user: updatedUser });

    } catch (error) {
        const messagetype = "error"
        const message = `An error occurred while updating the user -- ${error}`
        const filelocation = "updateuserdata.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({ message: "An error occurred while updating the user", error: error });
    }
};

export default normaluserupdate;
