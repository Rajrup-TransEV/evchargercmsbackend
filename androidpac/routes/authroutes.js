import { Router } from "express"
import { signupUser } from "../auth/signup/signup.js";
import { loginUser } from "../auth/login/loginuser.js";
import { verifyuser } from "../auth/authverify.js";
import verifyOTP from "../auth/verifyOTP.js";
import verifyloginOTP from "../auth/login/verifylogin.js";
import regenerateOtp from "../../lib/regenerateOtp.js";
const authRoutes = Router()
authRoutes.post("/signup",signupUser)
authRoutes.post("/login",loginUser)
authRoutes.post("/verifyuser",verifyuser)
authRoutes.post("/verifyotp",verifyOTP)
authRoutes.post("/verifyloginotp",verifyloginOTP)
authRoutes.post("/regenrateotp",regenerateOtp)
export default authRoutes;