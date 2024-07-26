import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const updateuserdata = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { uid } = req.body; // Assuming the UID is passed in the request body
    const { firstname, lastname, email, password, address, phonenumber, role, designation } = req.body;

    try {
        // Find the user profile by UID
        const userProfile = await prisma.userProfile.findFirstOrThrow({
            where: {
                uid
            }
        });

        // If user profile not found, return a 404 error
        if (!userProfile) {
            return res.status(404).json({ error: 'User profile not found' });
        }

        // Create an object to hold the updated data
        const updateData = {};

        // Only add fields that are provided in the request body
        if (firstname) updateData.firstname = firstname;
        if (lastname) updateData.lastname = lastname;
        if (email) updateData.email = email;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }
        if (address) updateData.address = address;
        if (phonenumber) updateData.phonenumber = phonenumber;
        if (role) updateData.role = role;
        if (designation) updateData.designation = designation;

        // Update the user profile
        const updatedUserProfile = await prisma.userProfile.update({
            where: {
                uid
            },
            data: updateData // Use the object with only the updated fields
        });

        // Return the updated user profile
        return res.status(200).json(updatedUserProfile);
    } catch (error) {
        // Handle errors
        if (error.code === 'P2025') {
            // This error code indicates that the record was not found
            return res.status(404).json({ error: 'User profile not found' });
        }
        console.error('Error updating user profile:', error);
        return res.status(500).json({ error: 'An error occurred while updating the user profile' });
    }
};

export default updateuserdata;