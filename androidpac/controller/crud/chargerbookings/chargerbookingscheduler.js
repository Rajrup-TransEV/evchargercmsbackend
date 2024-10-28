import { PrismaClient } from "@prisma/client";
import emailQueue from "../../../../lib/emailqueue.js";
import { DateTime } from "luxon"; // Using Luxon for better date handling

const prisma = new PrismaClient();

const sendReminderEmails = async () => {
    const now = DateTime.now().setZone("Asia/Kolkata");
    const reminderTime = now.plus({ minutes: 15 });

    try {
        // Find bookings that are about to start in the next 15 minutes and haven't sent reminders yet
        const upcomingBookings = await prisma.bookings.findMany({
            where: {
                bookingtimefrom: {
                    gte: now.toJSDate(),
                    lt: reminderTime.toJSDate(),
                },
                isbooked: true,
                remindersent: false, // Only get bookings where reminders have not been sent
            },
            select: {
                uid: true, // Include uid to update remindersent later
                bookingtimefrom: true,
                useruid: true,
            },
        });

        // Send reminder emails
        for (const booking of upcomingBookings) {
            // Fetch user info based on useruid
            const userInfo = await prisma.user.findFirstOrThrow({
                where: { uid: booking.useruid },
                select: {
                    email: true,
                    username: true,
                },
            });

            if (userInfo) {
                // Convert booking start time to IST
                const istBookingStartTime = DateTime.fromJSDate(booking.bookingtimefrom).setZone("Asia/Kolkata").toLocaleString(DateTime.DATETIME_MED);

                const subject = "Charger Booking Reminder";
                const text = `Hi ${userInfo.username},\n\nThis is a reminder that your charger booking will start at ${istBookingStartTime}.\n\nBest Regards,\nTeam Transev.`;

                await emailQueue.add({ to: userInfo.email, subject, text }, {
                    attempts: 5,
                    backoff: 10000,
                });

                console.log(`Reminder email sent to ${userInfo.email} for booking starting at ${istBookingStartTime}`);

                // Update the booking to mark the reminder as sent
                await prisma.bookings.update({
                    where: { uid: booking.uid }, // Use uid from the current booking
                    data: { remindersent: true }, // Set remindersent to true
                });
            } else {
                console.error(`User not found for user ID: ${booking.useruid}`);
            }
        }
    } catch (error) {
        console.error("Error sending reminder emails:", error);
    }
};

export default sendReminderEmails;
