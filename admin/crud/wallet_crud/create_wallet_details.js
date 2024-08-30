import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";


const prisma = new PrismaClient();

const create_wallet_details = async (req, res) => {
    try {
        const apiauthkey = req.headers['apiauthkey'];
        // Check if the API key is valid
        if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
            const messagetype = "error";
            const message = "API route access error";
            const filelocation = "create_wallet_details.js";
            logging(messagetype, message, filelocation);
            return res.status(403).json({ message: "API route access forbidden" });
        }

        const { userid } = req.body;
        //add null exception handeling
        if(!userid){
            const messagetype = "error";
            const message = "User id not needs to give in order to perform operation";
            const filelocation = "create_wallet_details.js";
            logging(messagetype, message, filelocation);
            return res.status(400),json({message:"User id not needs to give in order to perform operation"})
        }
        let price = "0";
        
        // Check if the user exists in appUserProfile
        const findAppUserProfile = await prisma.user.findUnique({
            where: { uid: userid },
            select: { uid: true }
        });

        // Check if the user exists in userProfile
        const findAdminUserProfile = await prisma.userProfile.findUnique({
            where: { uid: userid },
            select: { uid: true }
        });

        // Check if a wallet already exists for the user
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
            return res.status(409).json({
                message: "A wallet already exists for this user"
            });
        }

        // Create wallet based on which profile exists
        if (findAppUserProfile) {
            // Create wallet for appUserProfile
            const walletForAppUser = await prisma.wallet.create({
                data: {
                    uid: crypto.randomUUID(),
                    appuserrelatedwallet: userid,
                    balance: price
                }
            });
            const messagetype = "success";
            const message = `Wallet has been created for user -> details ${walletForAppUser}`;
            const filelocation = "create_wallet_details.js";
            logging(messagetype, message, filelocation);
            return res.status(201).json({
                message: "Wallet has been created for appUserProfile",
                details: walletForAppUser
            });
        } else if (findAdminUserProfile) {
            // Create wallet for userProfile
            const walletForAdminProfile = await prisma.wallet.create({
                data: {
                    uid: crypto.randomUUID(),
                    userprofilerelatedwallet: userid,
                    balance: price
                }
            });
            const messagetype = "success";
            const message = `Wallet has been created for user -> details ${walletForAdminProfile}`;
            const filelocation = "create_wallet_details.js";
            logging(messagetype, message, filelocation);
            return res.status(201).json({
                message: "Wallet created successfully for admin user profile",
                details: walletForAdminProfile
            });
        } else {
            // If neither user exists, return a 404 error
            const messagetype = "error";
            const message = `User not found with the given id`;
            const filelocation = "create_wallet_details.js";
            logging(messagetype, message, filelocation);
            return res.status(404).json({
                message: "User not found in either profile"
            });
        }
    } catch (error) {
        console.error(error);
        const messagetype = "error";
        const message = `Error: ${error.message}`;
        const filelocation = "create_wallet_details.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({
            message: "An error occurred while creating the wallet",
            error: error.message // Return error message for better debugging
        });
    }
};

export default create_wallet_details;
