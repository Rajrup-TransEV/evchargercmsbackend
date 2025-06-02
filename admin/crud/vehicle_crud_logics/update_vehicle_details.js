//update vehicle details
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const update_vehicle_details = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "update_vehicle_assign.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { uid } = req.body; // Assuming the UID is passed in the request body
    const { vehiclename, vehiclemodel, vehiclelicense, vehicleowner, vehiclecategory, vehicletype, isvehicleassigned } = req.body;

    try {
        // if(vehiclename===""||vehiclemodel===""||vehiclelicense===""||vehicleowner===""||vehiclecategory===""||vehicletype===""||isvehicleassigned===""){
        //     const messagetype = "error"
        //     const message = "vehicle data needs to give in oder to create a vehicle"
        //     const filelocation = "update_vehicle_assign.js"
        //     logging(messagetype,message,filelocation)
        //     return res.status(400).json({message:"vehicle data needs to give in oder to create a vehicle"})
        // }
        // Find the vehicle profile by UID
        const vehicleProfile = await prisma.assigntovechicles.findUnique({
            where: { uid }
        });

        // If vehicle profile not found, return a 404 error
        if (!vehicleProfile) {
            const messagetype = "error"
            const message = "Vehicle profile not found"
            const filelocation = "update_vehicle_assign.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json({ error: 'Vehicle profile not found' });
        }

        // Create an object to hold the updated data
        const updateData = {};
        const updatedFields = [];

        // Only add fields that are provided in the request body
        if (vehiclename) {
            updateData.vehiclename = vehiclename;
            updatedFields.push(`Vehicle Name: ${vehiclename}`);
            const messagetype = "update"
            const message = `Vehicle Name: ${vehiclename}`
            const filelocation = "update_vehicle_assign.js"
            logging(messagetype,message,filelocation)
        }
        if (vehiclemodel) {
            updateData.vehiclemodel = vehiclemodel;
            updatedFields.push(`Vehicle Model: ${vehiclemodel}`);
            const messagetype = "update"
            const message = `Vehicle Model: ${vehiclemodel}`
            const filelocation = "update_vehicle_assign.js"
            logging(messagetype,message,filelocation)
        }
        if (vehiclelicense) {
            updateData.vehiclelicense = vehiclelicense;
            updatedFields.push(`Vehicle License: ${vehiclelicense}`);
            const messagetype = "update"
            const message = `Vehicle License: ${vehiclelicense}`
            const filelocation = "update_vehicle_assign.js"
            logging(messagetype,message,filelocation)
        }
        if (vehicleowner) {
            updateData.vehicleowner = vehicleowner;
            updatedFields.push(`Vehicle Owner: ${vehicleowner}`);
            const messagetype = "update"
            const message = `Vehicle Owner: ${vehicleowner}`
            const filelocation = "update_vehicle_assign.js"
            logging(messagetype,message,filelocation)
        }
        if (vehiclecategory) {
            updateData.vehiclecategory = vehiclecategory;
            updatedFields.push(`Vehicle Category: ${vehiclecategory}`);
            const messagetype = "update"
            const message = `Vehicle Category: ${vehiclecategory}`
            const filelocation = "update_vehicle_assign.js"
            logging(messagetype,message,filelocation)   
        }
        if (vehicletype) {
            updateData.vehicletype = vehicletype;
            updatedFields.push(`Vehicle Type: ${vehicletype}`);
            const messagetype = "update"
            const message = `Vehicle Type: ${vehicletype}`
            const filelocation = "update_vehicle_assign.js"
            logging(messagetype,message,filelocation)   
        }
        if (isvehicleassigned !== undefined) { // Check for both true and false
            updateData.isvehicleassigned = isvehicleassigned;
            updatedFields.push(`Is Vehicle Assigned: ${isvehicleassigned}`);
            const messagetype = "update"
            const message = `Is Vehicle Assigned: ${isvehicleassigned}`
            const filelocation = "update_vehicle_assign.js"
            logging(messagetype,message,filelocation)  
        }

        // Update the vehicle profile
        const updatedVehicleProfile = await prisma.assigntovechicles.update({
            where: { uid },
            data: updateData // Use the object with only the updated fields
        });
        const messagetype = "success"
        const message = `data updated: ${JSON.stringify(updatedVehicleProfile, null, 2)}`
        const filelocation = "update_vehicle_assign.js"
        logging(messagetype,message,filelocation)  
        // Return the updated vehicle profile
        return res.status(200).json({ message:"data updated",data:updatedVehicleProfile});
    } catch (error) {
        // Handle errors
        if (error.code === 'P2025') {
            const messagetype = "error"
            const message = 'Vehicle profile not found'
            const filelocation = "update_vehicle_assign.js"
            logging(messagetype,message,filelocation) 
            // This error code indicates that the record was not found
            return res.status(404).json({ error: 'Vehicle profile not found' });
        }
        console.error('Error updating vehicle profile:', error);
        const messagetype = "error"
        const message = `An error occurred while updating the vehicle profile :: ${JSON.stringify(error)}`
        const filelocation = "update_vehicle_assign.js"
        logging(messagetype,message,filelocation) 
        return res.status(500).json({ error: 'An error occurred while updating the vehicle profile' });
    }
};

export default update_vehicle_details;
