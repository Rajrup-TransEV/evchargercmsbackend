import { Router } from "express"
import { signupUser } from "../auth/signup/signup.js";
import { loginUser } from "../auth/login/loginuser.js";
const authRoutes = Router()
authRoutes.post("/signup",signupUser)
authRoutes.post("/login",loginUser)
export default authRoutes;