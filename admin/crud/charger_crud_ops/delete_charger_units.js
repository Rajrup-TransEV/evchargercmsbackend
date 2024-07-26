//delete charger units one by one 
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const delete_charger_units = async (req, res) => {
    const { uid } = req.body; // Assuming the UID is passed in the request body

    try {
        // Validate that the UID is provided
        if (!uid) {
            return res.status(400).json({ error: 'Charger UID is required' });
        }

        // Delete the charger unit by UID
        const deletedCharger = await prisma.charger_Unit.delete({
            where: {
                uid:uid
            }
        });

        // Return a success message
        return res.status(200).json({ message: 'Charger unit deleted successfully'});
    } catch (error) {
        // Handle errors
        if (error.code === 'P2025') {
            // This error code indicates that the record was not found
            return res.status(404).json({ error: 'Charger unit not found or hasbeen removed from database' });
        }
        console.error('Error deleting charger unit:', error);
        return res.status(500).json({ error: 'An error occurred while deleting the charger unit' });
    }
};

export default delete_charger_units;