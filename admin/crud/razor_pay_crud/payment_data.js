import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../lib/customuids.js";

const prisma = new PrismaClient();

const gettransactions = async (req, res) => {
    const {masteradminid}=req.body;
    try {
        // Step 1: Fetch transactions
        const transtable = await prisma.transactionsdetails.findMany({
         where:{
            userid:masteradminid
         }
        });

        // Step 2: Extract unique user IDs and charger IDs
        const userIds = new Set();
        const chargerIds = new Set();

        transtable.forEach(transaction => {
            if (transaction.userid) userIds.add(transaction.userid);
            if (transaction.chargeruid) chargerIds.add(transaction.chargeruid);
        });

        // Step 3: Fetch user profiles and charger units based on extracted IDs
        const users = await prisma.userProfile.findMany({
            where: {
                uid: { in: Array.from(userIds) } // Convert Set to Array
            }
        });

        const chargers = await prisma.charger_Unit.findMany({
            where: {
                uid: { in: Array.from(chargerIds) } // Convert Set to Array
            }
        });
        const hubdetails = await prisma.addhub.findMany({
            where:{
                adminuid:{in:Array.from(userIds)}
            }
        })
        const driverdetails = await prisma.assigntovehicleowener.findMany({
            where:{
                adminid:{in:Array.from(userIds)}
            }
        })
        // Step 4: Map through transactions to include user and charger details
        const formattedTransactions = transtable.map(transaction => {
            const userDetails = users.find(user => user.uid === transaction.userid);
            const chargerDetails = chargers.find(charger => charger.uid === transaction.chargeruid);
            // const hubs = hubdetails.find(hubdetail=>hubdetail.adminuid)

            return {
                id: transaction.id,
                uid: transaction.uid,
                paymentid: transaction.paymentid,
                walletid: transaction.walletid,
                userid: transaction.userid,
                price: transaction.price,
                chargeruid: transaction.chargeruid,
                createdAt: transaction.createdAt,
                updatedAt: transaction.updatedAt,
                userDetails,     // Include user details
                chargerDetails,    // Include charger details,
            hubdetails,
            driverdetails
            };
        });

        // Send response with formatted transactions
        return res.status(200).json({message:"all of the data",data:formattedTransactions})
        // console.log(formattedTransactions)
    } catch (error) {
        console.log(error)
        // logging.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Internal Server Error",error:error });
    }
};

// Export the function for use in your routes
export default gettransactions;
