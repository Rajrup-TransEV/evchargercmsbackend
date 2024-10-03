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
import getqrcodedata from "../controller/crud/qrcodeops/get_qr_code_data.js"
import pprofiledetails from "../controller/crud/userprofilecrud/perticualuserdetails.js"
import favoritechargers from "../controller/crud/favorites/createfavorites.js"
import getfavoritechargerofauser from "../controller/crud/favorites/getfavoritecharges.js"
import chargerbookings from "../controller/crud/chargerbookings/chargerbookings.js"
import getlistofbookings from "../controller/crud/chargerbookings/getlistofbookedchargers.js"
import chargerstarttransactions from "../controller/crud/chargeroperations/chargerstart.js"
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
userRoutes.post("/updateprofile",userprofileupdate)
//delete user profile data
userRoutes.post("/deleteauserdata",delete_user_profile)
//generate a qrcode
userRoutes.post("/qrcode",generateqrcode)
//get all the qrcode
userRoutes.get("/getallqrcodes",getqrcodedata)
//getprofiledetails if a user
userRoutes.post("/puprofile",pprofiledetails)
//create favorites
userRoutes.post("/createfavorites",favoritechargers)
//get all the favorite chargers of a given user
userRoutes.post("/loffchargers",getfavoritechargerofauser)
//create charger booking details
userRoutes.post("/createbookings",chargerbookings)
//get list of bookings
userRoutes.post("/getbookings",getlistofbookings)
//chargerstart transaction
userRoutes.post("/startcharge",chargerstarttransactions)
export default userRoutes;