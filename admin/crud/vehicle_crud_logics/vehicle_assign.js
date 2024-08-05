import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Assign a vehicle to a driver
const assignVehicleToDriver = async (req, res) => {
    const { driverId, vehicleUid } = req.body;

    try {
        // Check if the driver is already assigned to another vehicle
        const existingAssignment = await prisma.assigntovechicles.findFirst({
            where: {
                driverId: driverId,
                isvehicleassigned: true,
            },
        });

        if (existingAssignment) {
            return res.status(400).json({ message: 'Driver is already assigned to another vehicle' });
        }

        // Check if the vehicle is not already assigned to another driver
        const vehicleAssignment = await prisma.assigntovechicles.findFirst({
            where: {
                uid: vehicleUid,
                isvehicleassigned: true,
            },
        });

        if (vehicleAssignment) {
            return res.status(400).json({ message: 'Vehicle is already assigned to another driver' });
        }

        // Check if the vehicle is free and not broken
        const vehicle = await prisma.assigntovechicles.findUnique({
            where: {
                uid: vehicleUid,
            },
        });

        if (!vehicle || vehicle.isvehicleassigned || vehicle.vehicletype === 'broken') {
            return res.status(400).json({ message: 'Vehicle is not available for assignment' });
        }

        // Check if the driver has a role of 'driver'
        const driver = await prisma.assigntoDriver.findUnique({
            where: {
                uid: driverId,
            },
        });

        if (!driver || driver.driverrole !== 'driver') {
            return res.status(400).json({ message: 'Driver is not authorized for vehicle assignment' });
        }

        // Assign the vehicle to the driver
        const updatedVehicle = await prisma.assigntovechicles.update({
            where: {
                uid: vehicleUid,
            },
            data: {
                driverId: driverId,
                isvehicleassigned: true,
            },
        });

        return res.status(200).json(updatedVehicle);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Assign a driver to a vehicle
const assignDriverToVehicle = async (req, res) => {
    const { driverId, vehicleUid } = req.body;

    try {
        // Check if the vehicle is already assigned to another driver
        const existingAssignment = await prisma.assigntovechicles.findFirst({
            where: {
                uid: vehicleUid,
                isvehicleassigned: true,
            },
        });

        if (existingAssignment) {
            return res.status(400).json({ message: 'Vehicle is already assigned to another driver' });
        }

        // Check if the driver is already assigned to another vehicle
        const driverAssignment = await prisma.assigntovechicles.findFirst({
            where: {
                driverId: driverId,
                isvehicleassigned: true,
            },
        });

        if (driverAssignment) {
            return res.status(400).json({ message: 'Driver is already assigned to another vehicle' });
        }

        // Check if the driver has a role of 'driver'
        const driver = await prisma.assigntoDriver.findUnique({
            where: {
                uid: driverId,
            },
        });

        if (!driver || driver.driverrole !== 'driver') {
            return res.status(400).json({ message: 'Driver is not authorized for vehicle assignment' });
        }

        // Check if the vehicle is free and not broken
        const vehicle = await prisma.assigntovechicles.findUnique({
            where: {
                uid: vehicleUid,
            },
        });

        if (!vehicle || vehicle.isvehicleassigned || vehicle.vehicletype === 'broken') {
            return res.status(400).json({ message: 'Vehicle is not available for assignment' });
        }

        // Assign the driver to the vehicle
        const updatedVehicle = await prisma.assigntovechicles.update({
            where: {
                uid: vehicleUid,
            },
            data: {
                driverId: driverId,
                isvehicleassigned: true,
            },
        });

        return res.status(200).json(updatedVehicle);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Export the functions for use in other parts of your application
export default { assignVehicleToDriver, assignDriverToVehicle };
