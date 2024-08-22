import express from "express"
import bodyParser from "body-parser";
import cros from "cors"

import { Router } from "express"

import adminmadeuserroutes from "./admin/admin_made_userroutes/admin_made_user_routes.js";

// import emailQueue from "./lib/emailqueue.js";
import userRoutes from "./androidpac/routes/userrouts.js";
import authRoutes from "./androidpac/routes/authroutes.js";
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron'
import { setupSwagger } from './swagger.js';

const prisma = new PrismaClient();
// import emailQueue from './lib/emailQueue.js'; // Adjust the path as necessary

// import adminmadeuserroutes from "./admin_made_userroutes/admin_made_user_routes.js"

const app = express()
const gateway = Router()
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(cros({
    origin:"*",
    methods:"*"
}))
//lopgging clear
  
//Cron job to delete logs older than 90 days
cron.schedule('0 0 * * *', async () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago
  
    try {
      const deletedLogs = await prisma.logRetention.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });
      console.log(`Deleted ${deletedLogs.count} logs older than 90 days.`);
    } catch (error) {
      console.error('Error deleting old logs:', error);
    }
  });
  
//corn job code delete logs older than 1 day
// cron.schedule('* * * * *', async () => { // Runs every minute for testing
//     const cutoffDate = new Date();
//     cutoffDate.setDate(cutoffDate.getDate() - 1); // 1 day ago
  
//     try {
//       const deletedLogs = await prisma.logRetention.deleteMany({
//         where: {
//           createdAt: {
//             lt: cutoffDate,
//           },
//         },
//       });
//       console.log(`Deleted ${deletedLogs.count} logs older than 1 day.`);
//     } catch (error) {
//       console.error('Error deleting old logs:', error);
//     }
//   });

// Define the gateway route
gateway.get("/", async (req, res) => {
    return res.status(400).json({ message: "API gateway access not allowed" });
});

// Use the gateway router for the root path
app.use("/", gateway); // Use the gateway router

//normal user signup api gateway
app.use("/userauth",authRoutes),
app.use("/admin",adminmadeuserroutes)
app.use("/users",userRoutes)

setupSwagger(app)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});