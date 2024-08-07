import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";


const prisma = new PrismaClient();

// Assign a vehicle to a driver
const assignVehicleToDriver = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "vehicle_assign.js"
         logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const { driverId, vehicleUid } = req.body;

    try {
        // Check if the driver is already assigned to another vehicle
        const existingDriverAssignment = await prisma.assigntovechicles.findFirst({
            where: {
                vehicleowenerId: driverId,
                isvehicleassigned: true,
            },
        });

        if (existingDriverAssignment) {
            const messagetype = "error"
            const message = "Driver is already assigned to another vehicle"
            const filelocation = "vehicle_assign.js"
            logging(messagetype,message,filelocation)
            return res.status(400).json({ message: 'Driver is already assigned to another vehicle' });
        }

        // Check if the vehicle is already assigned to another driver
        const existingVehicleAssignment = await prisma.assigntovechicles.findFirst({
            where: {
                uid: vehicleUid,
                isvehicleassigned: true,
            },
        });

        if (existingVehicleAssignment) {
            const messagetype = "error"
            const message = "Vehicle is already assigned to another driver"
            const filelocation = "vehicle_assign.js"
            logging(messagetype,message,filelocation)
            return res.status(400).json({ message: 'Vehicle is already assigned to another driver' });
        }

        // Check if the vehicle is free and not broken
        const vehicle = await prisma.assigntovechicles.findUnique({
            where: {
                uid: vehicleUid,
            },
        });

        if (!vehicle || vehicle.isvehicleassigned || vehicle.vehicletype === 'broken') {
            const messagetype = "error"
            const message = "Vehicle is not available for assignment"
            const filelocation = "vehicle_assign.js"
            logging(messagetype,message,filelocation)
            return res.status(400).json({ message: 'Vehicle is not available for assignment' });
        }

        // Check if the driver has a role of 'driver'
        const driver = await prisma.assigntovehicleowener.findUnique({
            where: {
                uid: driverId,
            },
        });

        if (!driver || driver.vehicleowenerrole !== 'vehicleowener') {
            const messagetype = "error"
            const message = "Driver is not authorized for vehicle assignment"
            const filelocation = "vehicle_assign.js"
            logging(messagetype,message,filelocation)
            return res.status(400).json({ message: 'Driver is not authorized for vehicle assignment' });
        }

        // Assign the vehicle to the driver
        const updatedVehicle = await prisma.assigntovechicles.update({
            where: {
                uid: vehicleUid,
            },
            data: {
                vehicleowenerId: driverId,
                isvehicleassigned: true,
            },
        });
        const messagetype = "success"
        const message = `Vehcile hasbeen assigned ${updatedVehicle}`
        const filelocation = "vehicle_assign.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:updatedVehicle});
    } catch (error) {
        console.error(error);
        const messagetype = "error"
        const message = `${JSON.stringify(error)}`
        const filelocation = "vehicle_assign.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({ message: `${error}` });
    }
};

// Assign a driver to a vehicle
const assignDriverToVehicle = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "vehicle_assign.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const { driverId, vehicleUid } = req.body;

    try {
        // Check if the vehicle is already assigned to another driver
        const existingVehicleAssignment = await prisma.assigntovechicles.findFirst({
            where: {
                uid: vehicleUid,
                isvehicleassigned: true,
            },
        });

        if (existingVehicleAssignment) {
            const messagetype = "error"
            const message = "Vehicle is already assigned to another driver"
            const filelocation = "vehicle_assign.js"
            logging(messagetype,message,filelocation)
            return res.status(400).json({ message: 'Vehicle is already assigned to another driver' });
        }

        // Check if the driver is already assigned to another vehicle
        const existingDriverAssignment = await prisma.assigntovechicles.findFirst({
            where: {
                vehicleowenerId: driverId,
                isvehicleassigned: true,
            },
        });

        if (existingDriverAssignment) {
            const messagetype = "error"
            const message = "Driver is already assigned to another vehicle"
            const filelocation = "vehicle_assign.js"
             logging(messagetype,message,filelocation)
            return res.status(400).json({ message: 'Driver is already assigned to another vehicle' });
        }

        // Check if the driver has a role of 'driver'
        const driver = await prisma.assigntovehicleowener.findUnique({
            where: {
                uid: driverId,
            },
        });

        if (!driver || driver.vehicleowenerrole !== 'vehicleowener') {
            const messagetype = "error"
            const message = "Driver is not authorized for vehicle assignment"
            const filelocation = "vehicle_assign.js"
             logging(messagetype,message,filelocation)
            return res.status(400).json({ message: 'Driver is not authorized for vehicle assignment' });
        }

        // Check if the vehicle is free and not broken
        const vehicle = await prisma.assigntovechicles.findUnique({
            where: {
                uid: vehicleUid,
            },
        });

        if (!vehicle || vehicle.isvehicleassigned || vehicle.vehicletype === 'broken') {
            const messagetype = "error"
            const message = "Vehicle is not available for assignment"
            const filelocation = "vehicle_assign.js"
             logging(messagetype,message,filelocation)
            return res.status(400).json({ message: 'Vehicle is not available for assignment' });
        }

        // Assign the driver to the vehicle
        const updatedVehicle = await prisma.assigntovechicles.update({
            where: {
                uid: vehicleUid,
            },
            data: {
                vehicleowenerId: driverId,
                isvehicleassigned: true,
            },
        });
        const messagetype = "success"
        const message = `message: "Assignment success", data: ${updatedVehicle}`
        const filelocation = "vehicle_assign.js"
         logging(messagetype,message,filelocation)
        return res.status(200).json({message:"Assignment success",data:updatedVehicle});
    } catch (error) {
        console.error(error);
        const messagetype = "error"
        const message = `${JSON.stringify(error)}`
        const filelocation = "vehicle_assign.js"
         logging(messagetype,message,filelocation)
        return res.status(500).json({ message: `${error}` });
    }
};

// Export the functions for use in other parts of your application
export default { assignVehicleToDriver, assignDriverToVehicle };
