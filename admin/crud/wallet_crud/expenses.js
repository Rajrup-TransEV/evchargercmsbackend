import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const expenses = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "expenses.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    try {
        // Fetch user details and admin details
        const usersDetails = await prisma.user.findMany();
        const adminDetails = await prisma.userProfile.findMany();
        // Create a map for quick lookup of user and admin details by uid
        const userMap = Object.fromEntries(usersDetails.map(user => [user.uid, user.username]));
        const adminMap = Object.fromEntries(adminDetails.map(admin => [admin.uid, admin.firstname]));

        // Fetch transaction details where userid matches any uid from users or admins
        const transactions = await prisma.transactionsdetails.findMany({
            where: {
                OR: [
                    { userid: { in: Object.keys(userMap) } },
                    { userid: { in: Object.keys(adminMap) } }
                ]
            },
            select: {
                paymentid: true,
                price: true,
                userid: true,
            }
        });

        // Enrich transactions with corresponding usernames and firstnames
        const enrichedTransactions = transactions.map(transaction => ({
            ...transaction,
            username: userMap[transaction.userid] || null, // Get username or null if not found
            firstname: adminMap[transaction.userid] || null // Get firstname or null if not found
        }));

        // Send response back to client
        res.status(200).json({
            transactions: enrichedTransactions
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "An error occurred while fetching data." });
    }
};

export default expenses;
