//delete charger units one by one 
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
const prisma = new PrismaClient();

const delete_charger_units = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "delete_charger_units.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const { uid } = req.body; // Assuming the UID is passed in the request body

    try {
        // Validate that the UID is provided
        if (uid==="") {
            const messagetype = "error"
            const message = "Charger UID is required"
            const filelocation = "delete_charger_units.js"
            logging(messagetype,message,filelocation)
            return res.status(400).json({ error: 'Charger UID is required' });
        }

        // Delete the charger unit by UID
        const deletedCharger = await prisma.charger_Unit.delete({
            where: {
                uid:uid
            }
        });
        const messagetype = "success"
        const message = "Charger unit deleted successfully"
        const filelocation = "delete_charger_units.js"
        logging(messagetype,message,filelocation)
        // Return a success message
        return res.status(200).json({ message: 'Charger unit deleted successfully'});
    } catch (error) {
        // Handle errors
        if (error.code === 'P2025') {
            const messagetype = "error"
            const message = "Charger unit not found or hasbeen removed from database"
            const filelocation = "delete_charger_units.js"
            logging(messagetype,message,filelocation)
            // This error code indicates that the record was not found
            return res.status(404).json({ error: 'Charger unit not found or hasbeen removed from database' });
        }
        console.error('Error deleting charger unit:', error);
        const messagetype = "error"
        const message = `error - ${error}`
        const filelocation = "delete_charger_units.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({ error: 'An error occurred while deleting the charger unit' });
    }
};

export default delete_charger_units;