import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const edit_wallet = async (req, res) => {
    try {
        const apiauthkey = req.headers['apiauthkey'];

        // Check if the API key is valid
        if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
            const messagetype = "error";
            const message = "API route access error";
            const filelocation = "edit_wallet_details.js";
            logging(messagetype, message, filelocation);
            return res.status(403).json({ message: "API route access forbidden" });
        }

        const { walletid, balance, iswalletrechargedone, recharger_made_by_which_user } = req.body;
        //     // null exception handeling
        // if(walletid===""||balance===""||iswalletrechargedone===""||recharger_made_by_which_user===""){
        //     const messagetype = "error";
        //     const message = "API route access error";
        //     const filelocation = "edit_wallet_details.js";
        //     logging(messagetype, message, filelocation);
        //     return res.status(400).json({ message: "Required fields " });
        // }
        // Find the wallet by ID
        const findWallet = await prisma.wallet.findUnique({
            where: { uid: walletid },
            select: {
                uid: true,
                userprofilerelatedwallet: true,
                appuserrelatedwallet: true,
                balance: true,
                iswalletrechargedone: true,
                recharger_made_by_which_user: true
            }
        });

        if (!findWallet) {
            return res.status(404).json({ error: "No wallet data found" });
        }

        // Create an object to hold the data to update
        const updateData = {};

        // Update fields if provided in the request body
        if (balance !== undefined) {
            updateData.balance = balance;
        }
        if (iswalletrechargedone !== undefined) {
            updateData.iswalletrechargedone = iswalletrechargedone;
        }
        if (recharger_made_by_which_user !== undefined) {
            updateData.recharger_made_by_which_user = recharger_made_by_which_user;
        }

        // Update the wallet in the database
        const updatedWallet = await prisma.wallet.update({
            where: { uid: walletid },
            data: updateData
        });

        const messagetype = "success";
        const message = `Wallet has been updated successfully -> details: ${updatedWallet}`;
        const filelocation = "edit_wallet_details.js";
        logging(messagetype, message, filelocation);

        return res.status(200).json({
            message: "Wallet updated successfully",
            details: updatedWallet
        });

    } catch (error) {
        console.error(error);
        const messagetype = "error";
        const message = `Error: ${error}`;
        const filelocation = "edit_wallet_details.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({
            message: "An error occurred while updating the wallet",
            error: error // Return error message for better debugging
        });
    }
};

export default edit_wallet;
