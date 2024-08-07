import { PrismaClient } from "@prisma/client";
import emailQueue from "../../../lib/emailqueue.js";

const prisma = new PrismaClient();

const edit_charger_details = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "edit_chargerunit_ops.js"
        logging(messagetype,message,filelocation)
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
            updatedFields.push(`Charger  serial number: ${Chargerserialnum}`);
            const messagetype = "update"
            const message = `Charger seraolnum: ${Chargerserialnum}`
            const filelocation = "edit_chargerunit.js"
            logging(messagetype,message,filelocation)
        }
        if (ChargerName) {
            updateData.ChargerName = ChargerName;
            const messagetype = "update"
            const message = `Charger Name: ${ChargerName}`
            const filelocation = "edit_chargerunit.js"
            logging(messagetype,message,filelocation)
            updatedFields.push(`Charger Name: ${ChargerName}`);
        }
        if (Chargerhost) {
            updateData.Chargerhost = Chargerhost;
            const messagetype = "update"
            const message = `Chargerhost: ${Chargerhost}`
            const filelocation = "edit_chargerunit.js"
            logging(messagetype,message,filelocation)
            updatedFields.push(`Charger Host: ${Chargerhost}`);
        }
        if (Segment) {
            updateData.Segment = Segment;
            const messagetype = "update"
            const message = `Segment: ${Segment}`
            const filelocation = "edit_chargerunit.js"
            logging(messagetype,message,filelocation)
            updatedFields.push(`Segment: ${Segment}`);
        }
        if (Subsegment) {
            updateData.Subsegment = Subsegment;
            const messagetype = "update"
            const message = `Subsegment: ${Subsegment}`
            const filelocation = "edit_chargerunit.js"
            logging(messagetype,message,filelocation)
            updatedFields.push(`Subsegment: ${Subsegment}`);
        }
        if (Total_Capacity) {
            updateData.Total_Capacity = Total_Capacity;
            const messagetype = "update"
            const message = `Total_Capacity: ${Total_Capacity}`
            const filelocation = "edit_chargerunit.js"
            logging(messagetype,message,filelocation)
            updatedFields.push(`Total Capacity: ${Total_Capacity}`);
        }
        if (Chargertype) {
            updateData.Chargertype = Chargertype;
            const messagetype = "update"
            const message = `Chargertype: ${Chargertype}`
            const filelocation = "edit_chargerunit.js"
            logging(messagetype,message,filelocation)
            updatedFields.push(`Charger Type: ${Chargertype}`);
        }
        if (parking) {
            updateData.parking = parking;
            const messagetype = "update"
            const message = `parking: ${parking}`
            const filelocation = "edit_chargerunit.js"
            logging(messagetype,message,filelocation)
            updatedFields.push(`Parking: ${parking}`);
        }
        if (number_of_connectors) {
            updateData.number_of_connectors = number_of_connectors;
            const messagetype = "update"
            const message = `number_of_connectors: ${number_of_connectors}`
            const filelocation = "edit_chargerunit.js"
            logging(messagetype,message,filelocation)
            updatedFields.push(`Number of Connectors: ${number_of_connectors}`);
        }
        if (Connector_type) {
            updateData.Connector_type = Connector_type;
            const messagetype = "update"
            const message = `Connector_type: ${Connector_type}`
            const filelocation = "edit_chargerunit.js"
            logging(messagetype,message,filelocation)
            updatedFields.push(`Connector Type: ${Connector_type}`);
        }
        if (connector_total_capacity) {
            updateData.connector_total_capacity = connector_total_capacity;
            const messagetype = "update"
            const message = `connector_total_capacity: ${connector_total_capacity}`
            const filelocation = "edit_chargerunit.js"
            logging(messagetype,message,filelocation)
            updatedFields.push(`Connector Total Capacity: ${connector_total_capacity}`);
        }
        if (lattitude) {
            updateData.lattitude = lattitude;
            const messagetype = "update"
            const message = `lattitude: ${lattitude}`
            const filelocation = "edit_chargerunit.js"
            logging(messagetype,message,filelocation)
            updatedFields.push(`Latitude: ${lattitude}`);
        }
        if (longitute) {
            updateData.longitute = longitute;
            const messagetype = "update"
            const message = `longitute: ${longitute}`
            const filelocation = "edit_chargerunit.js"
            logging(messagetype,message,filelocation)
            updatedFields.push(`Longitude: ${longitute}`);
        }
        if (full_address) {
            updateData.full_address = full_address;
            updatedFields.push(`Full Address: ${full_address}`);
            const messagetype = "update"
            const message = `full_address: ${full_address}`
            const filelocation = "edit_chargerunit.js"
            logging(messagetype,message,filelocation)
        }
        if (charger_use_type) {
            updateData.charger_use_type = charger_use_type;
            updatedFields.push(`Charger Use Type: ${charger_use_type}`);
            const messagetype = "update"
            const message = `charger_use_type: ${charger_use_type}`
            const filelocation = "edit_chargerunit.js"
            logging(messagetype,message,filelocation)
        }
        if (twenty_four_seven_open_status) {
            updateData.twenty_four_seven_open_status = twenty_four_seven_open_status;
            updatedFields.push(`24/7 Open Status: ${twenty_four_seven_open_status}`);
            const messagetype = "update"
            const message = `twenty_four_seven_open_status: ${twenty_four_seven_open_status}`
            const filelocation = "edit_chargerunit.js"
            logging(messagetype,message,filelocation)
        }
        if (charger_image) {
            updateData.charger_image = charger_image;
            updatedFields.push(`Charger Image: Updated`);
            const messagetype = "update"
            const message = `charger_image: ${charger_image}`
            const filelocation = "edit_chargerunit.js"
            logging(messagetype,message,filelocation)
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
        const messagetype = "error"
        const message = `error ${error}`
        const filelocation = "edit_chargerunit.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({ error: 'An error occurred while updating charger details' , data: error });
    }
};

export default edit_charger_details;