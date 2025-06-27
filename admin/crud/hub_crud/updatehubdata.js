import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const updatehub = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        logging("error", "API route access error", "updatehub.js");
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { hubid } = req.body; // expecting hub uid in the route param
    const {
        hubname,
        hubtariff,
        hublocation,
        adminuid,
        addChargerId,
        removeChargerId
    } = req.body;

    try {
        const hub = await prisma.addhub.findUnique({ where: { uid: hubid } });

        if (!hub) {
            logging("error", "Hub not found", "updatehub.js");
            return res.status(404).json({ message: "Hub not found" });
        }

        let updatedChargerList = hub.hubchargers || [];

        // If removeChargerId is provided, remove it
        if (removeChargerId) {
            updatedChargerList = updatedChargerList.filter(id => id !== removeChargerId);
        }

        // If addChargerId is provided, add it (only if not already present)
        if (addChargerId && !updatedChargerList.includes(addChargerId)) {
            updatedChargerList.push(addChargerId);
        }

        const updatedFields = {
            ...(hubname && { hubname }),
            ...(hubtariff && { hubtariff }),
            ...(hublocation && { hublocation }),
            ...(adminuid && { adminuid }),
            ...(req.body.hasOwnProperty("addChargerId") || req.body.hasOwnProperty("removeChargerId")
                ? { hubchargers: updatedChargerList }
                : {})
        };

        await prisma.addhub.update({
            where: { uid:hubid },
            data: updatedFields
        });

        logging("success", "Hub updated successfully", "updatehub.js");
        return res.status(200).json({ message: "Hub updated successfully" });
    } catch (error) {
        console.error(error);
        logging("error", `${error}`, "updatehub.js");
        return res.status(500).json({ error: error.message });
    }
};

export default updatehub;
