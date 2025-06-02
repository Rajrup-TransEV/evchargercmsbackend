import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const thisu = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "thisu.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { thuid, userid } = req.body;

    try {
        // Fetch transaction details
        const transactionDetails = await prisma.transactionsdetails.findMany({
            where: {
                OR: [
                    { uid: thuid },
                    { userid: userid }
                ]
            },
            select: {
                id: true,
                uid: true,
                paymentid: true,
                walletid: true,
                userid: true,
                price: true,
                chargeruid: true,
                createdAt: true,
                updatedAt: true
            }
        });

        // Fetch associated user details
        const associatedUserDetails = await prisma.user.findFirstOrThrow({
            where: {
                uid: userid
            },
            select: {
                id: true,
                uid: true,
                username: true,
                email: true,
                phonenumber:true
            }
        });

        // Combine transaction and user details into one object
        // const combinedDetails = {
        //     transactionDetails,
        //     userDetails: associatedUserDetails
        // };

        const messagetype = "success";
        const message = "List of data accessed successfully";
        const filelocation = "thisu.js";
        logging(messagetype, message, filelocation);

        return res.status(200).json({
            message: "Requested data for the user",
            td: transactionDetails,
            au:associatedUserDetails
        });
        
    } catch (error) {
        console.log(error);

        const messagetype = "error";
        const message = `${error}`;
        const filelocation = "thisu.js";
        logging(messagetype, message, filelocation);

        return res.status(500).json({
            message: "Error occurred",
            error: error.message // Send only the error message for better clarity
        });
    }
};

export default thisu;
