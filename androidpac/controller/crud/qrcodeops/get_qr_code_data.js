import fs from 'fs';
import path from 'path';

const getqrcodedata = async (req, res) => {
    try {
        const uploadsDir = path.join(__dirname, 'uploads'); // Path to the uploads directory
        const files = fs.readdirSync(uploadsDir); // Read the files in the uploads directory

        // Filter to only include PNG files (or any other format you expect)
        const qrCodeFiles = files.filter(file => file.endsWith('.png'));

        // Create an array of file paths to return
        const qrCodeData = qrCodeFiles.map(file => ({
            fileName: file,
            filePath: path.join('uploads', file) // Relative path to access the file
        }));

        return res.status(200).json({
            message: "QR code data retrieved successfully",
            data: qrCodeData
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
};

export default getqrcodedata;
