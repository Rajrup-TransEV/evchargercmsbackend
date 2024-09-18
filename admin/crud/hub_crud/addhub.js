import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../lib/customuids.js";

const prisma = new PrismaClient();

const addhub = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "addhub.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { hubname, hubchargers, hubtariff, hublocation, adminid } = req.body;

    // Validate hubchargers input
    if (!Array.isArray(hubchargers)) {
        const messagetype = "error";
        const message = "hubchargers must be an array";
        const filelocation = "addhub.js";
        logging(messagetype, message, filelocation);
        return res.status(400).json({ message: "Invalid hubchargers format" });
    }

    try {
        const createhub = await prisma.addhub.create({
            data: {
                uid: generateCustomRandomUID(),
                hubname: hubname,
                hubchargers: hubchargers, // Directly assign the array
                hubtariff: hubtariff,
                hublocation: hublocation,
                adminuid: adminid
            }
        });

        const messagetype = "success";
        const message = "Hub details added successfully";
        const filelocation = "addhub.js";
        logging(messagetype, message, filelocation);

        return res.status(201).json({ message: "Data has been created"});
    } catch (error) {
        console.error(error);
        const messagetype = "error";
        const message = `${error}`;
        const filelocation = "addhub.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({ error: error.message });
    }
};

export default addhub;
