import fs from 'fs';
import path from 'path';

// Function to save images
const saveImage = async (imageBuffer) => {
    try {
        const imageFilename = `${crypto.randomUUID()}`; // Randomize the filename without extension
        const uploadsDirectory = 'uploads'; // Directory to save images
        const imagePath = path.join(uploadsDirectory, imageFilename);

        // Check if the directory exists, if not, create it
        if (!fs.existsSync(uploadsDirectory)) {
            fs.mkdirSync(uploadsDirectory, { recursive: true });
            console.log(`Directory ${uploadsDirectory} created.`);
        }

        // Write the image buffer to a file
        fs.writeFileSync(imagePath, imageBuffer);

        console.log(`Image saved to ${imagePath}`);
        return {
            imagePath,
            imageFilename
        }; // Return the path and filename of the saved image
    } catch (error) {
        console.error('Error saving image:', error);
        throw error;
    }
}

export default saveImage;
