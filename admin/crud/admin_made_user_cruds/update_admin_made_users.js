import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import emailSender from "../../../lib/emailcreator.js";
import emailQueue from "../../../lib/emailqueue.js";


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
            where: { uid }
        });

        // If user profile not found, return a 404 error
        if (!userProfile) {
            return res.status(404).json({ error: 'User profile not found' });
        }

        // Create an object to hold the updated data
        const updateData = {};
        const updatedFields = [];

        // Only add fields that are provided in the request body
        if (firstname) {
            updateData.firstname = firstname;
            updatedFields.push(`First Name: ${firstname}`);
        }
        if (lastname) {
            updateData.lastname = lastname;
            updatedFields.push(`Last Name: ${lastname}`);
        }
        if (email) {
            updateData.email = email;
            updatedFields.push(`Email: ${email}`);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
            updatedFields.push(`Your password has been updated.`);
        }
        if (address) {
            updateData.address = address;
            updatedFields.push(`Address: ${address}`);
        }
        if (phonenumber) {
            updateData.phonenumber = phonenumber;
            updatedFields.push(`Phone Number: ${phonenumber}`);
        }
        if (role) {
            updateData.role = role;
            updatedFields.push(`Role: ${role}`);
        }
        if (designation) {
            updateData.designation = designation;
            updatedFields.push(`Designation: ${designation}`);
        }

        // Update the user profile
        const updatedUserProfile = await prisma.userProfile.update({
            where: { uid },
            data: updateData // Use the object with only the updated fields
        });

        // Prepare email content with updated information
        const to = email || userProfile.email; // Use the new email if provided, otherwise the old one
        const subject = `Hello  ${firstname || userProfile.firstname}, Your Information Has Been Updated`;
        const text = `Hello ${firstname || userProfile.firstname},\n\nYour information has been updated. Here are the changes:\n\n${updatedFields.join('\n')}\n\nThank you!`;

               // Add the email job to the queue
               console.log('Adding email job to queue:', { to, subject, text });
               await emailQueue.add({ to, subject, text }, {
                   attempts: 5, // Number of retry attempts
                   backoff: 10000 // Wait 10 seconds before retrying
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
