import { PrismaClient } from "@prisma/client";
import emailQueue from "../../../lib/emailqueue.js";

const prisma = new PrismaClient();

const edit_charger_details = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { uid } = req.body; // Assuming the UID is passed in the request body

    try {
        // Find the charger by UID
        const charger = await prisma.charger_Unit.findFirstOrThrow({
            where: { uid }
        });

        // Create an object to hold the updated data
        const updateData = {};
        const updatedFields = [];

        // Destructure the updated data from the request body
        const {
            Chargerserialnum,
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

        // Only add fields that are provided in the request body
        if(Chargerserialnum){
            updateData.Chargerserialnum = Chargerserialnum;
            updatedFields.push(`Charger Name: ${Chargerserialnum}`);
        }
        if (ChargerName) {
            updateData.ChargerName = ChargerName;
            updatedFields.push(`Charger Name: ${ChargerName}`);
        }
        if (Chargerhost) {
            updateData.Chargerhost = Chargerhost;
            updatedFields.push(`Charger Host: ${Chargerhost}`);
        }
        if (Segment) {
            updateData.Segment = Segment;
            updatedFields.push(`Segment: ${Segment}`);
        }
        if (Subsegment) {
            updateData.Subsegment = Subsegment;
            updatedFields.push(`Subsegment: ${Subsegment}`);
        }
        if (Total_Capacity) {
            updateData.Total_Capacity = Total_Capacity;
            updatedFields.push(`Total Capacity: ${Total_Capacity}`);
        }
        if (Chargertype) {
            updateData.Chargertype = Chargertype;
            updatedFields.push(`Charger Type: ${Chargertype}`);
        }
        if (parking) {
            updateData.parking = parking;
            updatedFields.push(`Parking: ${parking}`);
        }
        if (number_of_connectors) {
            updateData.number_of_connectors = number_of_connectors;
            updatedFields.push(`Number of Connectors: ${number_of_connectors}`);
        }
        if (Connector_type) {
            updateData.Connector_type = Connector_type;
            updatedFields.push(`Connector Type: ${Connector_type}`);
        }
        if (connector_total_capacity) {
            updateData.connector_total_capacity = connector_total_capacity;
            updatedFields.push(`Connector Total Capacity: ${connector_total_capacity}`);
        }
        if (lattitude) {
            updateData.lattitude = lattitude;
            updatedFields.push(`Latitude: ${lattitude}`);
        }
        if (longitute) {
            updateData.longitute = longitute;
            updatedFields.push(`Longitude: ${longitute}`);
        }
        if (full_address) {
            updateData.full_address = full_address;
            updatedFields.push(`Full Address: ${full_address}`);
        }
        if (charger_use_type) {
            updateData.charger_use_type = charger_use_type;
            updatedFields.push(`Charger Use Type: ${charger_use_type}`);
        }
        if (twenty_four_seven_open_status) {
            updateData.twenty_four_seven_open_status = twenty_four_seven_open_status;
            updatedFields.push(`24/7 Open Status: ${twenty_four_seven_open_status}`);
        }
        if (charger_image) {
            updateData.charger_image = charger_image;
            updatedFields.push(`Charger Image: Updated`);
        }

        // Update the charger details
        const updatedCharger = await prisma.charger_Unit.update({
            where: { uid },
            data: updateData // Use the object with only the updated fields
        });

        // Fetch the associated user information
        const associate = await prisma.charger_Unit.findFirstOrThrow({
            where: { uid },
            select: { userId: true }
        });

        const userIdData = associate.userId;
        const userData = await prisma.userProfile.findFirstOrThrow({
            where: { uid: userIdData },
            select: { firstname: true, email: true }
        });

        // Prepare email content
        const to = userData.email;
        const subject = `Hello ${userData.firstname}, Your Charger Details Have Been Updated`;
        const text = `Hello ${userData.firstname},\n\nYour charger details have been updated. Here are the changes:\n\n${updatedFields.join('\n')}\n\nThank you!`;

        // Add the email job to the queue
        console.log('Adding email job to queue:', { to, subject, text });
        await emailQueue.add({ to, subject, text }, {
            attempts: 5, // Number of retry attempts
            backoff: 10000 // Wait 10 seconds before retrying
        });

        // Return the updated charger details
        return res.status(200).json(updatedCharger);
    } catch (error) {
        console.error('Error updating charger details:', error);
        return res.status(500).json({ error: 'An error occurred while updating charger details' });
    }
};

export default edit_charger_details;