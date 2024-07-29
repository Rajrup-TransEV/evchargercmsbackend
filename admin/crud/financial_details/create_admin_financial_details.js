//create all financial details
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const add_user_financial_details = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { userid, bank_account_number, isfc_code, bank_name, branch_name, branch_address } = req.body;

    // Validate input
    if (!userid || !bank_account_number || !isfc_code || !bank_name || !branch_name || !branch_address) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Check if the user profile exists
        const userProfile = await prisma.userProfile.findUnique({
            where: { uid:userid},
        });

        if (!userProfile) {
            return res.status(404).json({ message: "User profile not found." });
        }

        // Create financial details associated with the user profile
        const financialDetails = await prisma.financial_details.create({
            data: {
                uid: crypto.randomUUID(),
                bank_account_number: bank_account_number,
                isfc_code: isfc_code,
                bank_name: bank_name,
                branch_name: branch_name,
                branch_address: branch_address,
                userProfileId: userid, // Associate with the user profile
            },
        });

        return res.status(201).json({ message: "Financial details added successfully.", financialDetails });
    } catch (error) {
        console.error("Error adding financial details:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export default add_user_financial_details;