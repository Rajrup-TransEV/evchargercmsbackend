import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import { getCache, setCache } from "../../../utils/cacheops.js";

const prisma = new PrismaClient();

const get_all_charger = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        logging("error", "API route access error", "get_all_charger_unit_ops.js");
        return res.status(403).json({ message: "API route access forbidden" });
    }

    try {
        const cacheddata = await getCache("all_charger_units");
        if (cacheddata) {
            logging("success", "Data retrieved from cache", "get_all_charger_unit_ops.js");
            return res.status(200).json({ message: "List of charger data is coming", data: cacheddata });
        }

        // Fetch all chargers
        const chargers = await prisma.charger_Unit.findMany();

        if (!chargers || chargers.length === 0) {
            logging("error", "No charger data found", "get_all_charger_unit_ops.js");
            return res.status(404).json({ message: "No charger data found" });
        }

        // Fetch all hubs
        const hubs = await prisma.addhub.findMany();

        // Attach hub data to each charger by matching id with hubchargers array
        const chargersWithHubs = chargers.map(charger => {
            const matchedHub = hubs.find(hub =>
                hub.hubchargers.includes(charger.uid)
            );

            return {
                ...charger,
                hubinfo: matchedHub
                    ? {
                        uid: matchedHub.uid,
                        hubname: matchedHub.hubname,
                        hubtariff: matchedHub.hubtariff,
                        hublocation: matchedHub.hublocation,
                        adminuid: matchedHub.adminuid
                    }
                    : null
            };
        });

        // Cache it
        await setCache("all_charger_units", chargersWithHubs, 3600);

        logging("success", "List of charger data is coming", "get_all_charger_unit_ops.js");
        return res.status(200).json({
            message: "List of charger data is coming",
            data: chargersWithHubs
        });

    } catch (error) {
        console.log(error);
        logging("error", `${error.message}`, "get_all_charger_unit_ops.js");
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

export default get_all_charger;
