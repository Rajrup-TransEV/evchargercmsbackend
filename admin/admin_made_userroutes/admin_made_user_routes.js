//admin users routes all routes which created by super user hasbeen assigned here
import { Router } from "express"
import admincreateuser from "../admin_to_user_profile/admin_to_user_profile_create.js"
import adminuserlogin from "../admin_made_userauth/signin/signin.js"
import asssign_buy_charger from "../crud/charger_unit_ops.js"
import alladminuserdata from "../crud/fetch_all_admin_data.js"
const adminmadeuserroutes = Router()
//create admin made by super admin
adminmadeuserroutes.post("/create/userprofilecreate",admincreateuser)
//super usermade login endpoint
adminmadeuserroutes.post("/login/userlogin",adminuserlogin)
//charger using buy assign
adminmadeuserroutes.post("/createchargerunit",asssign_buy_charger)
//get all of the super admin made admin data through route
adminmadeuserroutes.get("/getalladmindata",alladminuserdata)
export default adminmadeuserroutes;