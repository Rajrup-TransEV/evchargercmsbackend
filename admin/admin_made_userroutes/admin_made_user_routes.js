//admin users routes all routes which created by super user hasbeen assigned here
import { Router } from "express"
import admincreateuser from "../admin_to_user_profile/admin_to_user_profile_create.js"
import adminuserlogin from "../admin_made_userauth/signin/signin.js"
import asssign_buy_charger from "../crud/charger_crud_ops/charger_unit_ops.js"
import alladminuserdata from "../crud/admin_made_user_cruds/fetch_all_admin_data.js"
import get_all_charger from "../crud/charger_crud_ops/get_all_charger_unit_ops.js"
import edit_charger_details from "../crud/charger_crud_ops/edit_chargerunit.js"
import delete_charger_units from "../crud/charger_crud_ops/delete_charger_units.js"
const adminmadeuserroutes = Router()
//create admin made by super admin
adminmadeuserroutes.post("/create/userprofilecreate",admincreateuser)
//super usermade login endpoint
adminmadeuserroutes.post("/login/userlogin",adminuserlogin)
//charger using buy assign
adminmadeuserroutes.post("/createchargerunit",asssign_buy_charger)
//get all of the super admin made admin data through route
adminmadeuserroutes.get("/getalladmindata",alladminuserdata)
//all of the charger list data
adminmadeuserroutes.get("/listofcharges",get_all_charger)
//edit charger details one by one
adminmadeuserroutes.post("/editchargerdetails",edit_charger_details)
adminmadeuserroutes.post("/deletechargerunits",delete_charger_units)
export default adminmadeuserroutes;