import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const getlistofbookings = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "getlistofbookedchargers.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { userid } = req.body;

    try {
        // Fetch bookings for the specific user
        const bookings = await prisma.bookings.findMany({
            where: {
                useruid: userid,
            },
            select: {
                chargeruid: true,
                useruid: true,
                isbooked: true,
                createdAt: true,
                uid: true,
                updatedAt: true,
            },
        });

        // Check if any bookings were found
        if (bookings.length === 0) {
            const messagetype = "error";
            const message = "There are no bookings for this particular user.";
            const filelocation = "getlistofbookedchargers.js";
            logging(messagetype, message, filelocation);
            return res.status(404).json({ message: "No bookings have been made." });
        }

        // Extract charger UIDs from bookings
        const chargeruids = bookings.map(booking => booking.chargeruid);

        // Fetch charger details using the extracted UIDs
        const fetchchargerdetails = await prisma.charger_Unit.findMany({
            where: {
                uid: { in: chargeruids }, // Use 'in' operator for multiple UIDs
            },
        });

        // // Fetch hub details based on charger UIDs in JSON format
        // const hubdetails = await prisma.addhub.findMany({
        //     where: {
        //         hubchargers: {
        //             array_contains: chargeruids, // Use array_contains to check against JSON array
        //         },
        //     },
        // });

        // Return the response with booking, charger, and hub details
        return res.status(200).json({
            message: "Bookings retrieved successfully.",
            bookings,
            chargerDetails: fetchchargerdetails,
            // hubDetails: hubdetails.length > 0 ? hubdetails : null, // Return null if no hub found
        });
    } catch (error) {
        console.error(error);
        
        const messagetype = "error";
        const message = `${error.message || error}`;
        logging(messagetype, message, "getlistofbookedchargers.js");
        
        return res.status(500).json({ error: error.message || "An error occurred while fetching bookings." });
    }
};

export default getlistofbookings;
