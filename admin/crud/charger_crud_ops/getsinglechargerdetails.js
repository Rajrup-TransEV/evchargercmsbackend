import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path"; // Ensure you import path to handle file paths

const prisma = new PrismaClient();

const getsingledetails = async (req, res) => {
    const { chargeruid } = req.body;
    console.log(
        "chargeruid",chargeruid)
    try {
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
                chargerbuyer: true,
            }
        });
        const chargerimagedata = chargerdataforch.charger_image
        let chimagedataurl = null
        if(chargerdataforch){
            const chfilepath = path.resolve(chargerdataforch.charger_image)
            const filebuffer = fs.readFileSync(chfilepath)
            const base64chImage = filebuffer.toString('base64')
            chimagedataurl = `data:image/png;base64,${base64chImage}`;
        }
        const qrcodedata = await prisma.qRCode.findFirst({
            where: {
                chargerid: chargeruid
            },
            select: {
                qrcodedata: true
            }
        });

        if (qrcodedata && qrcodedata.qrcodedata) {
            // Use the appropriate path or method to access the image
            const filePath = path.resolve(qrcodedata.qrcodedata); // Adjust if necessary
            const fileBuffer = fs.readFileSync(filePath);

            // Convert the file buffer to Base64
            const base64Image = fileBuffer.toString('base64');
            const dataUrl = `data:image/png;base64,${base64Image}`; // Change 'image/png' if the image format is different

            return res.status(200).json({
                message: "requested data",
                chargerdata: chargerdataforch,
                qrdata: dataUrl,
                chargerimageurl:chimagedataurl
            });
        } else {
            return res.status(404).json({
                message: "QR code data not found",
                chargerdata: chargerdataforch
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred",
            error: error.message
        });
    }
};

export default getsingledetails;
