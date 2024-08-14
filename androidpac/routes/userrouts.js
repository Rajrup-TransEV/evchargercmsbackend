//normaluser normal routes

import { Router } from "express"
import allnormaluserdata from "../userlogics/getuserdata.js"
import normaluserupdate from "../userlogics/updateuserdata.js"
import get_one_user_data from "../userlogics/get_one_user.js"
import delete_user_data from "../userlogics/delete_a_user.js"
import userprofilecreate from "../controller/crud/userprofilecrud/user_profile_create.js"
import getalluserprofile from "../controller/crud/userprofilecrud/userprofile_get_all.js"
import userprofileupdate from "../controller/crud/userprofilecrud/user_profile_update.js"
import delete_user_profile from "../controller/crud/userprofilecrud/delete_user_profile.js"
import generateqrcode from "../controller/crud/qrcodeops/qrcode.js"
const userRoutes = Router()

//get all user
userRoutes.get("/alluserroutes",allnormaluserdata)
//update a single user
userRoutes.post("/updateuserdata",normaluserupdate)
//get a signgle user information nif you want to show any information to the user like profile
userRoutes.post("/getsingleuserinfo",get_one_user_data)
//delet a user from data base
userRoutes.post("/deletenormaluserdata",delete_user_data)
//userprofilecreate
userRoutes.post("/appuserprofilecreate",userprofilecreate)
//get all user profile data
userRoutes.get("/getallappuserdata",getalluserprofile)
// update user profile data
userRoutes.post("/updateappuserprofile",userprofileupdate)
//delete user profile data
userRoutes.post("/deleteauserdata",delete_user_profile)
userRoutes.get("/qrcode",generateqrcode)
export default userRoutes;