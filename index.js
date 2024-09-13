import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { Router } from "express";

import adminmadeuserroutes from "./admin/admin_made_userroutes/admin_made_user_routes.js";
import userRoutes from "./androidpac/routes/userrouts.js";
import authRoutes from "./androidpac/routes/authroutes.js";
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import { setupSwagger } from './swagger.js';

const prisma = new PrismaClient();

const app = express();
const gateway = Router();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json({ limit: '1000mb' })); // Set limit for JSON payloads
app.use(bodyParser.urlencoded({ limit: '1000mb', extended: true })); // Handle URL-encoded data

// CORS configuration
const corsOptions = {
    origin: "*",
    methods: "*",
    allowedHeaders: ['Content-Type', 'Authorization','apiauthkey'], // Add the headers you want to allow
    credentials: true, // Enable sending cookies across domains
};

app.use(cors(corsOptions));

// Cron job to delete logs older than 1 year
cron.schedule('0 0 * * *', async () => {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 1); // 1 year ago

    try {
        const deletedLogs = await prisma.logRetention.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate,
                },
            },
        });
        console.log(`Deleted ${deletedLogs.count} logs older than 1 year.`);
    } catch (error) {
        console.error('Error deleting old logs:', error);
    }
});

// Define the gateway route
gateway.get("/", async (req, res) => {
    return res.status(400).json({ message: "API gateway access not allowed" });
});

// Use the gateway router for the root path
app.use("/", gateway);

// Define your routes
app.use("/userauth", authRoutes);
app.use("/admin", adminmadeuserroutes);
app.use("/users", userRoutes);

// Setup Swagger
setupSwagger(app);

// General error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
