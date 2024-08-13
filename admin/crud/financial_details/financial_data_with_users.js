import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const getfindatawithuser = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "financial_data_with_users.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { userid, finid } = req.body;

    try {
        // Fetch the financial details along with the associated user profile
        const financialData = await prisma.financial_details.findUnique({
            where: {
                uid: finid, // Assuming finid is the primary key for Financial_details
            },
            include: {
                userProfile: true, // Include the associated UserProfile
            },
        });

        // Check if financial data was found
        if (!financialData) {
            const messagetype = "error"
            const message = "Financial details not found."
            const filelocation = "financial_data_with_users.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json({ message: "Financial details not found." });
        }

        // Check if the user ID matches
        if (!financialData.userProfile?.uid) {
            const messagetype = "error"
            const message = "User does not have access to these financial details."
            const filelocation = "financial_data_with_users.js"
            logging(messagetype,message,filelocation)
            return res.status(403).json({ message: "User does not have access to these financial details." });
        }
        const messagetype = "success"
        const message = "All of the financial data associate with users."
        const filelocation = "financial_data_with_users.js"
        logging(messagetype,message,filelocation)
        // Return the user and financial details
        return res.status(200).json({
            financialDetails: financialData,
        });
    } catch (error) {
        console.log("Error fetching financial data:", error);
        const messagetype = "error"
        const message = `Internal server error ${error}`
        const filelocation = "financial_data_with_users.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({ message: "Internal server error." });
    }
};

export default getfindatawithuser;