import fs from 'fs';
import path from 'path';
import qrcode from 'qrcode';

// Function to save QR code
const saveqrcode = async (data) => {
    try {
        // Generate QR code buffer
        const qrCodeBuffer = await qrcode.toBuffer(data);
        const qrCodeFilename = `${Date.now()}_qrcode.png`;
        const qrCodeDirectory = 'qrcodes'; // Directory to save QR codes
        const qrCodePath = path.join(qrCodeDirectory, qrCodeFilename);

        // Check if the directory exists, if not, create it
        if (!fs.existsSync(qrCodeDirectory)) {
            fs.mkdirSync(qrCodeDirectory, { recursive: true });
            console.log(`Directory ${qrCodeDirectory} created.`);
        }

        // Write the QR code buffer to a file
        fs.writeFileSync(qrCodePath, qrCodeBuffer);

        console.log(`QR code saved to ${qrCodePath}`);
       return {
            qrCodePath,
            qrCodeBuffer,qrCodeFilename
        }; // Return the path of the saved QR code
    } catch (error) {
        console.error('Error saving QR code:', error);
        throw error;
    }
}

export default saveqrcode;
