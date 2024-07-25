import express from "express"
import bodyParser from "body-parser";
import cros from "cors"
import authRoutes from "./routes/authroutes.js"
import adminmadeuserroutes from "./admin/admin_made_userroutes/admin_made_user_routes.js";
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
app.use("/api/auth",authRoutes),
app.use("/admin",adminmadeuserroutes)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});