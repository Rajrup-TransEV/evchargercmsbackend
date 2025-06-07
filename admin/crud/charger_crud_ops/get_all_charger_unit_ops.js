import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import { getCache, setCache } from "../../../utils/cacheops.js";
import fs from 'fs';

const prisma = new PrismaClient();

const get_all_charger = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "get_all_charger_unit_ops.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    try {
        // Try getting data from cache
        const cacheddata = await getCache("all_charger_units");
        if (cacheddata) {
            const messagetype = "success";
            const message = "Data retrieved from cache";
            const filelocation = "get_all_charger_unit_ops.js";
            logging(messagetype, message, filelocation);
            return res.status(200).json({ message: "List of charger data is coming", data: cacheddata });
        }

        // If not in cache, get from DB
        const get_all_charger_assigned = await prisma.charger_Unit.findMany();

        if (!get_all_charger_assigned || get_all_charger_assigned.length === 0) {
            const messagetype = "error";
            const message = "No charger data found";
            const filelocation = "get_all_charger_unit_ops.js";
            logging(messagetype, message, filelocation);
            return res.status(404).json({ message: "No charger data found" });
        }

        // Cache the result for 1 hour
        await setCache("all_charger_units", get_all_charger_assigned, 3600);

        const messagetype = "success";
        const message = "List of charger data is coming";
        const filelocation = "get_all_charger_unit_ops.js";
        logging(messagetype, message, filelocation);

        return res.status(200).json({ message: "List of charger data is coming", data: get_all_charger_assigned });

    } catch (error) {
        console.log(error);
        const messagetype = "error";
        const message = `${error.message}`;
        const filelocation = "get_all_charger_unit_ops.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}

export default get_all_charger;
