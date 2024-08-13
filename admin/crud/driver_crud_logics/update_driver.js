import { PrismaClient } from "@prisma/client";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const updateVehicleOwnerData = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "update_driver.js"
        logging(messagetype,message,filelocation)
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
            const messagetype = "error"
            const message = 'Vehicle owner profile not found'
            const filelocation = "update_driver.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json({ error: 'Vehicle owner profile not found' });
        }

        // Create an object to hold the updated data
        const updateData = {};
        const updatedFields = [];

        // Only add fields that are provided in the request body
        if (vehicleowenerfirstname) {
            updateData.vehicleowenerfirstname = vehicleowenerfirstname;
            updatedFields.push(`First Name: ${vehicleowenerfirstname}`);
            const messagetype = "update"
            const message = `First Name: ${vehicleowenerfirstname}`
            const filelocation = "update_driver.js"
            logging(messagetype,message,filelocation)
        }
        if (vehicleowenerlastename) {
            updateData.vehicleowenerlastename = vehicleowenerlastename;
            updatedFields.push(`Last Name: ${vehicleowenerlastename}`);
            const messagetype = "update"
            const message = `Last Name: ${vehicleowenerlastename}`
            const filelocation = "update_driver.js"
            logging(messagetype,message,filelocation)
        }
        if (vehicleoweneremail) {
            updateData.vehicleoweneremail = vehicleoweneremail;
            updatedFields.push(`Email: ${vehicleoweneremail}`);
            const messagetype = "update"
            const message = `Email: ${vehicleoweneremail}`
            const filelocation = "update_driver.js"
            logging(messagetype,message,filelocation)
        }
        if (phonenumber) {
            updateData.phonenumber = phonenumber;
            updatedFields.push(`Phone Number: ${phonenumber}`);
            const messagetype = "update"
            const message = `Phone Number: ${phonenumber}`
            const filelocation = "update_driver.js"
            logging(messagetype,message,filelocation)
        }
        if (vehicleowenerlicense) {
            updateData.vehicleowenerlicense = vehicleowenerlicense;
            updatedFields.push(`License: ${vehicleowenerlicense}`);
            const messagetype = "update"
            const message = `License: ${vehicleowenerlicense}`
            const filelocation = "update_driver.js"
            logging(messagetype,message,filelocation)
        }
        if (vehicleowenergovdocs) {
            updateData.vehicleowenergovdocs = vehicleowenergovdocs;
            updatedFields.push(`Government Documents: ${vehicleowenergovdocs}`);
            const messagetype = "update"
            const message = `Government Documents: ${vehicleowenergovdocs}`
            const filelocation = "update_driver.js"
            logging(messagetype,message,filelocation)
        }
        if (vehicleowenernationality) {
            updateData.vehicleowenernationality = vehicleowenernationality;
            updatedFields.push(`Nationality: ${vehicleowenernationality}`);
            const messagetype = "update"
            const message = `Nationality: ${vehicleowenernationality}`
            const filelocation = "update_driver.js"
            logging(messagetype,message,filelocation)
        }
        if (vehicleowenerid) {
            updateData.vehicleowenerid = vehicleowenerid;
            updatedFields.push(`ID: ${vehicleowenerid}`);
            const messagetype = "update"
            const message = `ID: ${vehicleowenerid}`
            const filelocation = "update_driver.js"
            logging(messagetype,message,filelocation)
        }
        if (vehicleoweneraddress) {
            updateData.vehicleoweneraddress = vehicleoweneraddress;
            updatedFields.push(`Address: ${vehicleoweneraddress}`);
            const messagetype = "update"
            const message = `Address: ${vehicleoweneraddress}`
            const filelocation = "update_driver.js"
            logging(messagetype,message,filelocation)
        }
        if (vehicleowenerrole) {
            updateData.vehicleowenerrole = vehicleowenerrole;
            updatedFields.push(`Role: ${vehicleowenerrole}`);
            const messagetype = "update"
            const message = `Role: ${vehicleowenerrole}`
            const filelocation = "update_driver.js"
            logging(messagetype,message,filelocation)
        }

        // Update the vehicle owner profile
        const updatedVehicleOwnerProfile = await prisma.assigntovehicleowener.update({
            where: { uid: uid },
            data: updateData
        });

       // Prepare email content with updated information
        const to = vehicleoweneremail || vehicleOwnerProfile.vehicleoweneremail; // Use the new email if provided, otherwise the old one
        const subject = `Hello ${vehicleowenerfirstname || vehicleOwnerProfile.vehicleowenerfirstname}, Your Information Has Been Updated`;
        const text = `Hello ${vehicleowenerfirstname || vehicleOwnerProfile.vehicleowenerfirstname},\n\nYour information has been updated. Here are the changes:\n\n${updatedFields.join('\n')}\n\nThank you!`;

        // Add the email job to the queue
        console.log('Adding email job to queue:', { to, subject, text });
        await emailQueue.add({ to, subject, text }, {
            attempts: 5, // Number of retry attempts
            backoff: 10000 // Wait 10 seconds before retrying
        });
        const messagetype = "success"
        const message = `data updated: ${JSON.stringify(updatedVehicleOwnerProfile, null, 2)}`
        const filelocation = "update_driver.js"
        logging(messagetype,message,filelocation) 
        // Return the updated vehicle owner profile
        return res.status(200).json(updatedVehicleOwnerProfile);
    } catch (error) {
        // Handle errors
        console.error('Error updating vehicle owner profile:', error);
        const messagetype = "error"
        const message = `An error occurred while updating the vehicle profile :: ${JSON.stringify(error)}`
        const filelocation = "update_driver.js"
        logging(messagetype,message,filelocation) 
        return res.status(500).json({ error: 'An error occurred while updating the vehicle owner profile' });
    }
};

export default updateVehicleOwnerData;
