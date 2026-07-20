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
        // Create an object to hold the data to update
        const updateData = {};

        // Update fields if provided in the request body
        if (balance !== undefined) {
            const parsedBalance = Number(balance);
            if (!Number.isFinite(parsedBalance)) {
                return res.status(400).json({ message: "Balance must be a finite number" });
            }
            updateData.balance = parsedBalance.toFixed(2);
        }
        if (iswalletrechargedone !== undefined) {
            updateData.iswalletrechargedone = iswalletrechargedone;
        }
        if (recharger_made_by_which_user !== undefined) {
            updateData.recharger_made_by_which_user = recharger_made_by_which_user;
        }

        // Serialize manual edits with charging deductions and recharge callbacks.
        const updatedWallet = await prisma.$transaction(async (tx) => {
            const locked = await tx.$queryRaw`
                SELECT id, uid FROM wallet WHERE uid = ${String(walletid)} FOR UPDATE
            `;
            if (locked.length !== 1) return null;
            return tx.wallet.update({
                where: { uid: String(walletid) },
                data: updateData
            });
        }, { isolationLevel: "ReadCommitted", maxWait: 10000, timeout: 20000 });

        if (!updatedWallet) {
            return res.status(404).json({ error: "No wallet data found" });
        }

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
