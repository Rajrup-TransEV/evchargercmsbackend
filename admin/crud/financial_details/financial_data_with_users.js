import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getfindatawithuser = async (req, res) => {
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
            return res.status(404).json({ message: "Financial details not found." });
        }

        // Check if the user ID matches
        if (financialData.userProfile?.uid !== userid) {
            return res.status(403).json({ message: "User does not have access to these financial details." });
        }

        // Return the user and financial details
        return res.status(200).json({
            user: financialData.userProfile,
            financialDetails: financialData,
        });
    } catch (error) {
        console.error("Error fetching financial data:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export default getfindatawithuser;