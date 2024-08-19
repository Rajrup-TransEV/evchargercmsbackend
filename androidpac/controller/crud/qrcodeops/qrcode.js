import qrcode from "qrcode";
import fs from 'fs';
import path from 'path';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const generateqrcode = async (req, res) => {
    try {
        const { chargerserialnumber, chargerid } = req.body;
        try {
            const externaluri = process.env.EXTERNAL_URI
            const concaturi = externaluri + "/chargers"
            
        } catch (error) {
            
        }

        const data = `
        ${chargerserialnumber},
        ${chargerid},
        ${chargercapacity},
        ${totalchargetime}
        `;

        // Generate QR code as a Buffer
        const qrcodeBuffer = await qrcode.toBuffer(data);

        // Define the path where the QR code will be saved
        const qrCodeFileName = `${Date.now()}_qrcode.png`;
        const qrCodeFilePath = path.join('uploads', qrCodeFileName);

        // Ensure the uploads directory exists
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads'); // Create the uploads directory if it doesn't exist
        }

        // Write the QR code buffer to a file
        fs.writeFileSync(qrCodeFilePath, qrcodeBuffer);

        // Save the QR code data in the database
        const qrcodedatasave = await prisma.qrcode.create({
            data: {
                uid:crypto.randomUUID(),
                chargerserialnumber,
                chargerid,
                chargercapacity,
                totalchargetime,
                qrcodedata: qrCodeFilePath // Save the file path in the database
            }
        });

        // Respond with success message and file path
        return res.status(200).json({
            message: "Charger QR code data saved successfully",
            filePath: qrCodeFilePath // Return the saved file path
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: `${error}` });
    }
};

export default generateqrcode;
