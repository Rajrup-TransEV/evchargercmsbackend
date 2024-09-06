import fs from 'fs';
import Jimp from 'jimp';
import QrCodeReader from 'qrcode-reader';

// Function to read and decode QR code
const readQRCode = async (filePath) => {
    try {
        // Read the image file into a buffer
        const buffer = fs.readFileSync(filePath);

        // Use Jimp to read the image
        const image = await Jimp.read(buffer);

        // Create an instance of QrCodeReader
        const qrCodeReader = new QrCodeReader();

        // Decode the QR code
        qrCodeReader.callback = (err, value) => {
            if (err) {
                console.error('Error decoding QR code:', err);
            } else {
                console.log('QR code data:', value.result);
            }
        };

        // Decode the image bitmap
        qrCodeReader.decode(image.bitmap);
    } catch (error) {
        console.error('Error reading QR code:', error);
    }
};

// Example usage
const qrCodeFilePath = 'qrcodes/your_qrcode_image.png'; // Replace with your QR code image path
readQRCode(qrCodeFilePath);
