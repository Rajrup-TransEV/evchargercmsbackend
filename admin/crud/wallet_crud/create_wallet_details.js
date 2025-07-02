import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../lib/customuids.js";
import dotenv from "dotenv"
dotenv.config()

const prisma = new PrismaClient();
const ASSOCIATED_ADMINID=process.env.ASSOCIATED_ADMIN

const create_wallet_details = async (userid) => {
        const adminuid = ASSOCIATED_ADMINID
        let price = "0";
        try { 
        const findAppUserProfile = await prisma.user.findUnique({
            where: { uid: userid },
            select: { uid: true }
        });

        const existingWallet = await prisma.wallet.findFirst({
            where: {
                OR: [
                    { appuserrelatedwallet: userid },
                    { userprofilerelatedwallet: userid }
                ]
            }
        });

        if (existingWallet) {
            const messagetype = "error";
            const message = `Wallet already exists for user with ID ${userid}`;
            const filelocation = "create_wallet_details.js";
            logging(messagetype, message, filelocation);
            return "Wallet already exists for user with ID " + userid
        }

        if (findAppUserProfile) {
            const walletForAppUser = await prisma.wallet.create({
                data: {
                    uid:generateCustomRandomUID(),
                    appuserrelatedwallet: userid,
                    balance: price,
                    associatedadminuid:adminuid
                }
            });
            const messagetype = "success";
            const message = `Wallet has been created for user -> details ${walletForAppUser}`;
            const filelocation = "create_wallet_details.js";
            logging(messagetype, message, filelocation);
            return "Wallet has been created for appUserProfile" + walletForAppUser
        } else {
            const messagetype = "error";
            const message = `User not found with the given id`;
            const filelocation = "create_wallet_details.js";
            logging(messagetype, message, filelocation);
            return "User not found in either profile"
        }
    } catch (error) {
        console.error(error);
        const messagetype = "error";
        const message = `Error: ${error.message}`;
        const filelocation = "create_wallet_details.js";
        logging(messagetype, message, filelocation);
        return "An error occurred while creating the wallet" + error.message
    }
};

export default create_wallet_details;
