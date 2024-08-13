import express from "express"
import bodyParser from "body-parser";
import cros from "cors"

import adminmadeuserroutes from "./admin/admin_made_userroutes/admin_made_user_routes.js";

import emailQueue from "./lib/emailqueue.js";
import userRoutes from "./androidpac/routes/userrouts.js";
import authRoutes from "./androidpac/routes/authroutes.js";
// import emailQueue from './lib/emailQueue.js'; // Adjust the path as necessary

// import adminmadeuserroutes from "./admin_made_userroutes/admin_made_user_routes.js"

const app = express()

const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(cros({
    origin:"*",
    methods:"*"
}))



//normal user signup api gateway
app.use("/userauth",authRoutes),
app.use("/admin",adminmadeuserroutes)
app.use("/users",userRoutes)
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});