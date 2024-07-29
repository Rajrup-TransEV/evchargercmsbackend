import { Router } from "express"
import { signupUser } from "../auth/signup/signup.js";
import { loginUser } from "../auth/login/loginuser.js";
import { verifyuser } from "../auth/authverify.js";
import verifyOTP from "../auth/verifyOTP.js";
const authRoutes = Router()
authRoutes.post("/signup",signupUser)
authRoutes.post("/login",loginUser)
authRoutes.post("/verifyuser",verifyuser)
authRoutes.post("/verifyotp",verifyOTP)
export default authRoutes;