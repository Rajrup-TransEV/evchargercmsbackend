import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../../lib/customuids.js";
import emailQueue from "../../../../lib/emailqueue.js";

const prisma = new PrismaClient();

const chargerBookings = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "chargerbookings.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { chargeruid, useruid, isbooked, bookingtimefrom, bookingtimeto } = req.body;

    // Convert string 'true'/'false' to boolean
    const isBookedBoolean = (isbooked === 'true') || (isbooked === 'false' ? false : undefined);

    try {
        // Fetch user info
        const userinfo = await prisma.user.findFirstOrThrow({
            where: {
                uid: useruid
            },
            select: {
                email: true,
                username: true
            }
        });

        // Convert booking times from IST to Date objects (IST remains as is)
        const istBookingTimeFrom = new Date(bookingtimefrom);
        const istBookingTimeTo = new Date(bookingtimeto);

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
                data: { 
                    isbooked: isBookedBoolean,
                    bookingtimefrom: istBookingTimeFrom,
                    bookingtimeto: istBookingTimeTo,
                    remindersent: false, // Reset reminderSent when updating
                },
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
                    bookingtimefrom: istBookingTimeFrom,
                    bookingtimeto: istBookingTimeTo,
                    remindersent: false, // Set reminderSent to false when creating new booking
                },
            });

            const messagetype = "success";
            const message = "Booking created successfully";
            logging(messagetype, message, "chargerbookings.js");

            // Send confirmation email with IST times for display purposes
            const subject = "Charger Booking Confirmation";
            const text = `
            Hi ${userinfo.username},

            Your charger has been booked successfully from ${istBookingTimeFrom.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} to ${istBookingTimeTo.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}.

            Best Regards,

            Team Transev.
            `;

            await emailQueue.add({ to: userinfo.email, subject, text }, {
                attempts: 5,
                backoff: 10000
            });

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

export default chargerBookings;
