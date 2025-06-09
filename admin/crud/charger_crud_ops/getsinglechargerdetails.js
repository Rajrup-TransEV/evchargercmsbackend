import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const getsingledetails = async (req, res) => {
    const { chargeruid } = req.body;
    console.log("chargeruid", chargeruid);

    try {
        // Get charger details
        const chargerdataforch = await prisma.charger_Unit.findFirst({
            where: {
                uid: chargeruid
            },
            select: {
                uid: true,
                Chargerserialnum: true,
                ChargerName: true,
                Chargerhost: true,
                Segment: true,
                Subsegment: true,
                Total_Capacity: true,
                Chargertype: true,
                parking: true,
                number_of_connectors: true,
                Connector_type: true,
                connector_total_capacity: true,
                lattitude: true,
                longitute: true,
                full_address: true,
                charger_use_type: true,
                twenty_four_seven_open_status: true,
                charger_image: true,
                chargerbuyer: true
            }
        });

        if (!chargerdataforch) {
            return res.status(404).json({ message: "Charger not found" });
        }

        // Read charger image and convert to base64
        let chimagedataurl = null;
        if (chargerdataforch.charger_image) {
            const chfilepath = path.resolve(chargerdataforch.charger_image);
            if (fs.existsSync(chfilepath)) {
                const filebuffer = fs.readFileSync(chfilepath);
                const base64chImage = filebuffer.toString('base64');
                chimagedataurl = `data:image/png;base64,${base64chImage}`;
            }
        }

        // Get QR code
        const qrcodedata = await prisma.qRCode.findFirst({
            where: { chargerid: chargeruid },
            select: { qrcodedata: true }
        });

        let qrImageUrl = null;
        if (qrcodedata && qrcodedata.qrcodedata) {
            const filePath = path.resolve(qrcodedata.qrcodedata);
            if (fs.existsSync(filePath)) {
                const fileBuffer = fs.readFileSync(filePath);
                const base64Image = fileBuffer.toString('base64');
                qrImageUrl = `data:image/png;base64,${base64Image}`;
            }
        }

        // Get all hubs and find the one that contains the chargeruid
        const hubs = await prisma.addhub.findMany();
        const matchedHub = hubs.find(hub => hub.hubchargers.includes(chargeruid));

        let hubinfo = null;
        if (matchedHub) {
            hubinfo = {
                uid: matchedHub.uid,
                hubname: matchedHub.hubname,
                hubtariff: matchedHub.hubtariff,
                hublocation: matchedHub.hublocation,
                adminuid: matchedHub.adminuid
            };
        }

        return res.status(200).json({
            message: "Requested data",
            chargerdata: chargerdataforch,
            chargerimageurl: chimagedataurl,
            qrdata: qrImageUrl,
            hubinfo: hubinfo
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred",
            error: error.message
        });
    }
};

export default getsingledetails;
