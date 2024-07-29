//normaluser normal routes

import { Router } from "express"
import allnormaluserdata from "../userlogics/getuserdata.js"
const userRoutes = Router()

//get all user

userRoutes.get("/alluserroutes",allnormaluserdata)

export default userRoutes;