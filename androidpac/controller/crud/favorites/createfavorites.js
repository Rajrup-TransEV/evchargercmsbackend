import { PrismaClient } from "@prisma/client";
import generateCustomRandomUID from "../../../../lib/customuids.js";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv"
dotenv.config()

const prisma = new PrismaClient();
const ASSOCIATED_ADMINID=process.env.ASSOCIATED_ADMIN

const favoritechargers = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "createfavorites.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { chargeruid, useruid, isfavorite } = req.body;

    // Convert string 'true'/'false' to boolean
    const isFavoriteBoolean = (isfavorite === 'true') || (isfavorite === 'false' ? false : undefined);

    try {
        // Check if the charger already exists in favorites for the user using chargeruid and useruid
        const existingFavorite = await prisma.favorites.findFirst({
            where: {
                chargeruid: chargeruid,
                useruid: useruid,

            },
        });

        let result;

        if (existingFavorite) {
            // Update the existing favorite entry
            result = await prisma.favorites.update({
                where: { uid: existingFavorite.uid },
                data: { isfavorite: isFavoriteBoolean },
            });

            const messagetype = "success";
            const message = "Favorite status updated successfully";
            logging(messagetype, message, "createfavorites.js");
            return res.status(200).json({ message: "Charger favorite status updated", result });
        } else {
            // Create a new favorite entry
            result = await prisma.favorites.create({
                data: {
                    uid: generateCustomRandomUID(),
                    chargeruid,
                    useruid,
                    isfavorite: isFavoriteBoolean,
                    associatedadminid:ASSOCIATED_ADMINID
                },
            });

            const messagetype = "success";
            const message = "Data has been created successfully";
            logging(messagetype, message, "createfavorites.js");
            return res.status(201).json({ message: "Charger added to favorites", result });
        }
    } catch (error) {
        const messagetype = "error";
        const message = `${error.message || error}`;
        logging(messagetype, message, "createfavorites.js");
        console.error(error);
        return res.status(500).json({ error: error.message || error });
    }
};

export default favoritechargers;
