import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const getfavoritechargerofauser = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "getfavoritechargerofauser.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { userid } = req.body;

    try {
        // Fetch favorite chargers for the user
        const favorites = await prisma.favorites.findMany({
            where: {
                useruid: userid,
            },
            select: {
                chargeruid: true,
                useruid: true,
                isfavorite: true,
                createdAt: true,
                uid: true,
                updatedAt: true,
            },
        });

        // Check if any favorites were found
        if (favorites.length === 0) {
            const messagetype = "error";
            const message = "No favorite chargers found for this user.";
            const filelocation = "getfavoritechargerofauser.js";
            logging(messagetype, message, filelocation);
            return res.status(404).json({ message: "No favorite chargers found for this user." });
        }

        // Extract charger UIDs from favorites
        const chargerUids = favorites.map(favorite => favorite.chargeruid);

        // Fetch charger details using the extracted UIDs
        const chargerDetails = await prisma.charger_Unit.findMany({
            where: {
                uid: { in: chargerUids }, // Use 'in' operator for multiple UIDs
            },
        });

        const messagetype = "success";
        const message = "data retrive successfully";
        const filelocation = "getfavoritechargerofauser.js";
        logging(messagetype, message, filelocation);
        return res.status(200).json({
            message: "All data retrieved successfully",
            favoritedata: favorites,
            chargerdata: chargerDetails,
        });
    } catch (error) {
        const messagetype = "error";
        const message = `${error}`;
        logging(messagetype, message, "getfavoritechargerofauser.js");
        console.error(error);
        return res.status(500).json({ error:error });
    }
};

export default getfavoritechargerofauser;
