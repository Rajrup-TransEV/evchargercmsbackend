import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../../lib/customuids.js";

const prisma = new PrismaClient();

const chargerbookings = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "chargerbookings.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { chargeruid, useruid, isbooked } = req.body;

    // Convert string 'true'/'false' to boolean
    const isBookedBoolean = (isbooked === 'true') || (isbooked === 'false' ? false : undefined);

    try {
        // Check if a booking already exists for this charger and user
        const existingBooking = await prisma.bookings.findFirst({
            where: {
                chargeruid: chargeruid,
                useruid: useruid,
            },
        });

        let result;

        if (existingBooking) {
            // Update the existing booking entry
            result = await prisma.bookings.update({
                where: { uid: existingBooking.uid },
                data: { isbooked: isBookedBoolean },
            });

            const messagetype = "success";
            const message = "Booking status updated successfully";
            logging(messagetype, message, "chargerbookings.js");
            return res.status(200).json({ message: "Charger booking status updated", result });
        } else {
            // Create a new booking entry
            result = await prisma.bookings.create({
                data: {
                    uid: generateCustomRandomUID(),
                    chargeruid,
                    useruid,
                    isbooked: isBookedBoolean,
                },
            });

            const messagetype = "success";
            const message = "Booking created successfully";
            logging(messagetype, message, "chargerbookings.js");
            return res.status(201).json({ message: "Charger booked successfully", result });
        }
    } catch (error) {
        const messagetype = "error";
        const message = `${error.message || error}`;
        logging(messagetype, message, "chargerbookings.js");
        console.error(error);
        return res.status(500).json({ error: error.message || error });
    }
};

export default chargerbookings;
