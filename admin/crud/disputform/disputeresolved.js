import { PrismaClient } from "@prisma/client";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const disputeresolved = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "disputeresolved.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { id } = req.body;

    try {
        // Fetch the current dispute status
        const currentDispute = await prisma.disputFrom.findUnique({
            where: { id: id },
            select: { resolvedstatus: true }, // Only select the resolvedstatus field
        });

        if (!currentDispute) {
            return res.status(404).json({ message: "Dispute not found" });
        }

        // Toggle the resolved status
        const newResolvedStatus = !currentDispute.resolvedstatus;

        // Update the dispute with the new resolved status
        await prisma.disputFrom.update({
            where: { id: id },
            data: { resolvedstatus: newResolvedStatus }
        });

        const messagetype = "success";
        const message = `Dispute status has been updated to ${newResolvedStatus ? 'resolved' : 'not resolved'}`;
        const filelocation = "disputeresolved.js";
        logging(messagetype, message, filelocation);
        
        return res.status(200).json({ message: `This issue has been marked as ${newResolvedStatus ? 'resolved' : 'not resolved'}` });

    } catch (error) {
        console.error(error);
        const messagetype = "error";
        const message = `${error.message || error}`;
        const filelocation = "disputeresolved.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({ error: error.message || "An error occurred" });
    }
};

export default disputeresolved;
