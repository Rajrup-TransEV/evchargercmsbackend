//normaluser normal routes

import { Router } from "express"
import allnormaluserdata from "../userlogics/getuserdata.js"
import normaluserupdate from "../userlogics/updateuserdata.js"
import get_one_user_data from "../userlogics/get_one_user.js"
import delete_user_data from "../userlogics/delete_a_user.js"
const userRoutes = Router()

//get all user
userRoutes.get("/alluserroutes",allnormaluserdata)
//update a single user
userRoutes.post("/updateuserdata",normaluserupdate)
//get a signgle user information nif you want to show any information to the user like profile
userRoutes.post("/getsingleuserinfo",get_one_user_data)
//delet a user from data base
userRoutes.post("/deletenormaluserdata",delete_user_data)

export default userRoutes;