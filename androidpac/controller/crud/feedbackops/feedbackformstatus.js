//feedback fom status
import logging from "../../../../logging/logging_generate.js";

import { PrismaClient } from '@prisma/client'; // Assuming you're using Prisma for database interaction
const prisma = new PrismaClient();

const feedbackformstatus = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "feedbackformstatus.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { uid } = req.body; // Assuming you're passing an id to identify the feedback

    try {
        // Fetch the existing feedback record
        const feedback = await prisma.feedback.findUnique({
            where: { uid: uid },
        });

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        // Toggle the status
        const updatedStatus = !feedback.isserveytook; // Toggle logic

        // Update the feedback record with the new status
        const updatedFeedback = await prisma.feedback.update({
            where: { id: id },
            data: {
                isserveytook: updatedStatus,
                updatedAt: new Date(), // Update timestamp
            },
        });

        return res.status(200).json({data:updatedFeedback});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default feedbackformstatus;