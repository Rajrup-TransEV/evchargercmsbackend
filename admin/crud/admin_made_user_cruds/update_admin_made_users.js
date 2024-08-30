import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";


const prisma = new PrismaClient();

const updateuserdata = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "update_admin_made_users.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { uid } = req.body; // Assuming the UID is passed in the request body
    const { firstname, lastname, email, password, address, phonenumber, role, designation } = req.body;
    if(uid ==="" ||firstname===""|| lastname===""||phonenumber==="" || email==="" || password===""||role===""||designation===""||address===""){
        const messagetype = "error"
        const message = "No value provided for one or more fields."
        const filelocation = "update_admin_made_users.js"
        logging(messagetype,message,filelocation)
        return res.status(400).json({ error: 'No value provided for one or more fields.' });
    }
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
            const messagetype = "update"
            const message = `First Name: ${firstname}`
            const filelocation = "update_admin_made_users.js"
            logging(messagetype,message,filelocation)
        }
        if (lastname) {
            updateData.lastname = lastname;
            updatedFields.push(`Last Name: ${lastname}`);
            const messagetype = "update"
            const message = `Last Name: ${lastname}`
            const filelocation = "update_admin_made_users.js"
            logging(messagetype,message,filelocation)
        }
        if (email) {
            updateData.email = email;
            updatedFields.push(`Email: ${email}`);
            const messagetype = "update"
            const message = `Email: ${email}`
            const filelocation = "update_admin_made_users.js"
            logging(messagetype,message,filelocation)
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
            updatedFields.push(`Your password has been updated.`);
            const messagetype = "update"
            const message = `Your password has been updated.`
            const filelocation = "update_admin_made_users.js"
            logging(messagetype,message,filelocation)
        }
        if (address) {
            updateData.address = address;
            updatedFields.push(`Address: ${address}`);
            const messagetype = "update"
            const message =`Address: ${address}`
            const filelocation = "update_admin_made_users.js"
            logging(messagetype,message,filelocation)
        }
        if (phonenumber) {
            updateData.phonenumber = phonenumber;
            updatedFields.push(`Phone Number: ${phonenumber}`);
            const messagetype = "update"
            const message =`Phone Number: ${phonenumber}`
            const filelocation = "update_admin_made_users.js"
            logging(messagetype,message,filelocation)
        }
        if (role) {
            updateData.role = role;
            updatedFields.push(`Role: ${role}`);
            const messagetype = "update"
            const message =`Role: ${role}`
            const filelocation = "update_admin_made_users.js"
            logging(messagetype,message,filelocation)
        }
        if (designation) {
            updateData.designation = designation;
            updatedFields.push(`Designation: ${designation}`);
            const messagetype = "update"
            const message =`Designation: ${designation}`
            const filelocation = "update_admin_made_users.js"
            logging(messagetype,message,filelocation)
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
               const messagetype = "sucess"
               const message =`Data update success`
               const filelocation = "update_admin_made_users.js"
               logging(messagetype,message,filelocation)
        // Return the updated user profile
        return res.status(200).json({message:"updated user profile data",data:updatedUserProfile});
    } catch (error) {
        // Handle errors
        if (error.code === 'P2025') {
            // This error code indicates that the record was not found
            const messagetype = "error"
            const message =`User profile not found`
            const filelocation = "update_admin_made_users.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json({ error: 'User profile not found' });
        }
        console.error('Error updating user profile:', error);
        const messagetype = "error"
        const message =`An error occurred while updating the user profile ${error}`
        const filelocation = "update_admin_made_users.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({ error: 'An error occurred while updating the user profile' });
    }
};

export default updateuserdata;
