import express from "express"
import bodyParser from "body-parser";
import cros from "cors"
import authRoutes from "./routes/authroutes.js"
import multer from 'multer';
import path from 'path';
const app = express()

const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(cros({
    origin:"*",
    methods:"*"
}))


// // Set up storage for uploaded files
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Directory to save uploaded files
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the original filename
//     }
// });

// // Initialize multer with the storage configuration
// const upload = multer({ storage });

// // Create an endpoint for uploading images
// app.post('/metods/uploads', upload.single('image'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).send('No file uploaded.');
//     }
//     res.status(200).send({
//         message: 'File uploaded successfully',
//         file: req.file
//     });
// });

//normal user signup api gateway
app.use("/api/auth",authRoutes),


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});