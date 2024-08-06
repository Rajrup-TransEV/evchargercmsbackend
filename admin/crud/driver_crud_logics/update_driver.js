import { PrismaClient } from "@prisma/client";
import emailQueue from "../../../lib/emailqueue.js";

const prisma = new PrismaClient();

const updateVehicleOwnerData = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const {
        uid,
        vehicleoweneremail,
        phonenumber,
        vehicleowenerfirstname,
        vehicleowenerlastename,
        vehicleowenerlicense,
        vehicleowenergovdocs,
        vehicleowenernationality,
        vehicleowenerid,
        vehicleoweneraddress,
        vehicleowenerrole
    } = req.body;

    try {
        // Find the vehicle owner profile by uid
        const vehicleOwnerProfile = await prisma.assigntovehicleowener.findUnique({
            where: {
                uid: uid
            }
        });

        // If vehicle owner profile not found, return a 404 error
        if (!vehicleOwnerProfile) {
            return res.status(404).json({ error: 'Vehicle owner profile not found' });
        }

        // Create an object to hold the updated data
        const updateData = {};
        const updatedFields = [];

        // Only add fields that are provided in the request body
        if (vehicleowenerfirstname) {
            updateData.vehicleowenerfirstname = vehicleowenerfirstname;
            updatedFields.push(`First Name: ${vehicleowenerfirstname}`);
        }
        if (vehicleowenerlastename) {
            updateData.vehicleowenerlastename = vehicleowenerlastename;
            updatedFields.push(`Last Name: ${vehicleowenerlastename}`);
        }
        if (vehicleoweneremail) {
            updateData.vehicleoweneremail = vehicleoweneremail;
            updatedFields.push(`Email: ${vehicleoweneremail}`);
        }
        if (phonenumber) {
            updateData.phonenumber = phonenumber;
            updatedFields.push(`Phone Number: ${phonenumber}`);
        }
        if (vehicleowenerlicense) {
            updateData.vehicleowenerlicense = vehicleowenerlicense;
            updatedFields.push(`License: ${vehicleowenerlicense}`);
        }
        if (vehicleowenergovdocs) {
            updateData.vehicleowenergovdocs = vehicleowenergovdocs;
            updatedFields.push(`Government Documents: ${vehicleowenergovdocs}`);
        }
        if (vehicleowenernationality) {
            updateData.vehicleowenernationality = vehicleowenernationality;
            updatedFields.push(`Nationality: ${vehicleowenernationality}`);
        }
        if (vehicleowenerid) {
            updateData.vehicleowenerid = vehicleowenerid;
            updatedFields.push(`ID: ${vehicleowenerid}`);
        }
        if (vehicleoweneraddress) {
            updateData.vehicleoweneraddress = vehicleoweneraddress;
            updatedFields.push(`Address: ${vehicleoweneraddress}`);
        }
        if (vehicleowenerrole) {
            updateData.vehicleowenerrole = vehicleowenerrole;
            updatedFields.push(`Role: ${vehicleowenerrole}`);
        }

        // Update the vehicle owner profile
        const updatedVehicleOwnerProfile = await prisma.assigntovehicleowener.update({
            where: { uid: uid },
            data: updateData
        });

        // Prepare email content with updated information
        // const to = vehicleoweneremail || vehicleOwnerProfile.vehicleoweneremail; // Use the new email if provided, otherwise the old one
        // const subject = `Hello ${vehicleowenerfirstname || vehicleOwnerProfile.vehicleowenerfirstname}, Your Information Has Been Updated`;
        // const text = `Hello ${vehicleowenerfirstname || vehicleOwnerProfile.vehicleowenerfirstname},\n\nYour information has been updated. Here are the changes:\n\n${updatedFields.join('\n')}\n\nThank you!`;

        // // Add the email job to the queue
        // console.log('Adding email job to queue:', { to, subject, text });
        // await emailQueue.add({ to, subject, text }, {
        //     attempts: 5, // Number of retry attempts
        //     backoff: 10000 // Wait 10 seconds before retrying
        // });

        // Return the updated vehicle owner profile
        return res.status(200).json(updatedVehicleOwnerProfile);
    } catch (error) {
        // Handle errors
        console.error('Error updating vehicle owner profile:', error);
        return res.status(500).json({ error: 'An error occurred while updating the vehicle owner profile' });
    }
};

export default updateVehicleOwnerData;
