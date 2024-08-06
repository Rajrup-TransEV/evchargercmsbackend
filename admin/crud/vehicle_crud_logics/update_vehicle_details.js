//update vehicle details
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const update_vehicle_details = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { uid } = req.body; // Assuming the UID is passed in the request body
    const { vehiclename, vehiclemodel, vehiclelicense, vehicleowner, vehiclecategory, vehicletype, isvehicleassigned } = req.body;

    try {
        // Find the vehicle profile by UID
        const vehicleProfile = await prisma.assigntovechicles.findUnique({
            where: { uid }
        });

        // If vehicle profile not found, return a 404 error
        if (!vehicleProfile) {
            return res.status(404).json({ error: 'Vehicle profile not found' });
        }

        // Create an object to hold the updated data
        const updateData = {};
        const updatedFields = [];

        // Only add fields that are provided in the request body
        if (vehiclename) {
            updateData.vehiclename = vehiclename;
            updatedFields.push(`Vehicle Name: ${vehiclename}`);
        }
        if (vehiclemodel) {
            updateData.vehiclemodel = vehiclemodel;
            updatedFields.push(`Vehicle Model: ${vehiclemodel}`);
        }
        if (vehiclelicense) {
            updateData.vehiclelicense = vehiclelicense;
            updatedFields.push(`Vehicle License: ${vehiclelicense}`);
        }
        if (vehicleowner) {
            updateData.vehicleowner = vehicleowner;
            updatedFields.push(`Vehicle Owner: ${vehicleowner}`);
        }
        if (vehiclecategory) {
            updateData.vehiclecategory = vehiclecategory;
            updatedFields.push(`Vehicle Category: ${vehiclecategory}`);
        }
        if (vehicletype) {
            updateData.vehicletype = vehicletype;
            updatedFields.push(`Vehicle Type: ${vehicletype}`);
        }
        if (isvehicleassigned !== undefined) { // Check for both true and false
            updateData.isvehicleassigned = isvehicleassigned;
            updatedFields.push(`Is Vehicle Assigned: ${isvehicleassigned}`);
        }

        // Update the vehicle profile
        const updatedVehicleProfile = await prisma.assigntovechicles.update({
            where: { uid },
            data: updateData // Use the object with only the updated fields
        });

        // Prepare email content with updated information
        const subject = `Vehicle Details Updated`;
        const text = `The following vehicle details have been updated:\n\n${updatedFields.join('\n')}\n\nThank you!`;

        // Log the update action (optional)
        console.log('Vehicle details updated:', { uid, updatedFields });

        // Return the updated vehicle profile
        return res.status(200).json(updatedVehicleProfile);
    } catch (error) {
        // Handle errors
        if (error.code === 'P2025') {
            // This error code indicates that the record was not found
            return res.status(404).json({ error: 'Vehicle profile not found' });
        }
        console.error('Error updating vehicle profile:', error);
        return res.status(500).json({ error: 'An error occurred while updating the vehicle profile' });
    }
};

export default update_vehicle_details;
