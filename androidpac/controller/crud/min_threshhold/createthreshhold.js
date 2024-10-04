import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../../lib/customuids.js";

const prisma = new PrismaClient();

const createminthreshhold = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "createthreshhold.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { minbalance } = req.body;

    try {
        // Check if a minimum balance already exists
        const existingBalance = await prisma.minimumbalance.findFirst();

        if (existingBalance) {
            // Update the existing minimum balance
            await prisma.minimumbalance.update({
                where: { id: existingBalance.id }, // Assuming 'id' is the primary key
                data: { minbalance: minbalance }
            });
            const messagetype = "success";
            const message = "Minimum balance has been updated successfully";
            const filelocation = "createthreshhold.js";
            logging(messagetype, message, filelocation);
            return res.status(200).json({ message: "Minimum balance has been updated successfully" });
        } else {
            // Create a new minimum balance entry
            await prisma.minimumbalance.create({
                data: {
                    uid: generateCustomRandomUID(),
                    minbalance: minbalance
                }
            });
            const messagetype = "success";
            const message = "Minimum balance data has been created successfully";
            const filelocation = "createthreshhold.js";
            logging(messagetype, message, filelocation);
            return res.status(200).json({ message: "Minimum balance has been set successfully" });
        }
    } catch (error) {
        console.log(error);
        const messagetype = "error";
        const message = `${error}`;
        const filelocation = "createthreshhold.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({ error: error.message });
    }
}

export default createminthreshhold;
