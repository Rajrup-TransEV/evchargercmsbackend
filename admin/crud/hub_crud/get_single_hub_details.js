import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const GetSingleHubDetails = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "get_single_hub_details.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { uid,hubchargerid } = req.body; // Expecting a single hub charger ID

    try {
        // Ensure hubchargerid is provided
        if (!hubchargerid) {
            return res.status(400).json({ message: "hubchargerid is required." });
        }
        // Query to find hubs that contain the specific hubchargerid in the hubchargers JSON field
        const getdetails = await prisma.addhub.findMany({
            where: {
                OR: [
                    { uid: uid }, // Check for matching uid
                    { hubchargers: { array_contains: [hubchargerid] } } // Check if hubchargers array includes the specific charger ID
                ]
            }
        });

        // Check if any details were found
        if (getdetails.length === 0) {
            return res.status(404).json({ message: "No hub found with the provided charger ID." });
        }

        const messagetype = "success";
        const message = "Single hub details retrieved successfully.";
        const filelocation = "get_single_hub_details.js";
        logging(messagetype, message, filelocation);
        
        return res.status(200).json({ message: "Requested data", data: getdetails });
    } catch (error) {
        console.error(error);
        const messagetype = "error";
        const message = `${error.message}`;
        const filelocation = "get_single_hub_details.js";
        logging(messagetype, message, filelocation);
        
        return res.status(500).json({ message: "An error occurred while retrieving hub details." });
    }
}

export default GetSingleHubDetails;
