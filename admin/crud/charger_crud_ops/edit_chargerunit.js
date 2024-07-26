//edit information of a single charger unit hasbeen assigned below

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const edit_charger_details  = async (req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      return res.status(403).json({ message: "API route access forbidden" });
  }
    const { uid } = req.body; // Assuming the UID is passed in the URL parameters

    try {
        // Find the charger by UID
        const charger = await prisma.charger_Unit.findFirstOrThrow({
            where: {
                uid
            }
        });

        // If charger not found, return a 404 error
        if (!charger) {
            return res.status(404).json({ error: 'Charger not found' });
        }

        // Destructure the updated data from the request body
        const {
            ChargerName,
            Chargerhost,
            Segment,
            Subsegment,
            Total_Capacity,
            Chargertype,
            parking,
            number_of_connectors,
            Connector_type,
            connector_total_capacity,
            lattitude,
            longitute,
            full_address,
            charger_use_type,
            twenty_four_seven_open_status,
            charger_image
        } = req.body;

        // Create an object to hold the updated data
        const updateData = {};

        // Only add fields that are provided in the request body
        if (ChargerName) updateData.ChargerName = ChargerName;
        if (Chargerhost) updateData.Chargerhost = Chargerhost;
        if (Segment) updateData.Segment = Segment;
        if (Subsegment) updateData.Subsegment = Subsegment;
        if (Total_Capacity) updateData.Total_Capacity = Total_Capacity;
        if (Chargertype) updateData.Chargertype = Chargertype;
        if (parking) updateData.parking = parking;
        if (number_of_connectors) updateData.number_of_connectors = number_of_connectors;
        if (Connector_type) updateData.Connector_type = Connector_type;
        if (connector_total_capacity) updateData.connector_total_capacity = connector_total_capacity;
        if (lattitude) updateData.lattitude = lattitude;
        if (longitute) updateData.longitute = longitute;
        if (full_address) updateData.full_address = full_address;
        if (charger_use_type) updateData.charger_use_type = charger_use_type;
        if (twenty_four_seven_open_status) updateData.twenty_four_seven_open_status = twenty_four_seven_open_status;
        if (charger_image) updateData.charger_image = charger_image;

        // Update the charger details
        const updatedCharger = await prisma.charger_Unit.update({
            where: {
                uid:uid
            },
            data: updateData // Use the object with only the updated fields
        });

        // Return the updated charger details
        return res.status(200).json(updatedCharger);
    } catch (error) {
        console.error('Error updating charger details:', error);
        return res.status(500).json({ error: 'An error occurred while updating charger details' });
    }
};

export default edit_charger_details