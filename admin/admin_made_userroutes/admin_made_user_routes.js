//admin users routes all routes which created by super user hasbeen assigned here
import { Router } from "express"
import admincreateuser from "../admin_to_user_profile/admin_to_user_profile_create.js"
import adminuserlogin from "../admin_made_userauth/signin/signin.js"
import asssign_buy_charger from "../crud/charger_crud_ops/charger_unit_ops.js"
import alladminuserdata from "../crud/admin_made_user_cruds/fetch_all_admin_data.js"
import get_all_charger from "../crud/charger_crud_ops/get_all_charger_unit_ops.js"
import edit_charger_details from "../crud/charger_crud_ops/edit_chargerunit.js"
import delete_charger_units from "../crud/charger_crud_ops/delete_charger_units.js"
import user_who_bought_the_charger_details from "../crud/charger_crud_ops/user_who_bought_which_charger.js"
import updateuserdata from "../crud/admin_made_user_cruds/update_admin_made_users.js"
import delete_user_profile from "../crud/admin_made_user_cruds/delete_admin_made_users.js"
import createrole from "../crud/admin_to_user_role_assignment/role_assignment_create.js"
import get_all_roles from "../crud/admin_to_user_role_assignment/get_all_of_the_role.js"
import update_user_role_details from "../crud/admin_to_user_role_assignment/update_a_role_details.js"
import get_user_by_role from "../crud/admin_to_user_role_assignment/get_user_details_by_role.js"
import createlistofroles from "../crud/admin_to_user_role_assignment/role_create_main.js"
import associateRoleToUser from "../crud/admin_to_user_role_assignment/role_assignment_create.js"
import delete_a_role from "../crud/admin_to_user_role_assignment/delete_a_role.js"
import adminUserLogout from "../admin_made_userauth/signin/logout.js"
import add_user_financial_details from "../crud/financial_details/create_admin_financial_details.js"
import getallfinancialdetails from "../crud/financial_details/get_all_financial_details.js"
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
//delete charger details one by one
adminmadeuserroutes.post("/deletechargerunits",delete_charger_units)
// which user bought which charger that details
adminmadeuserroutes.post("/getchargerbyuserid",user_who_bought_the_charger_details)
//update superuser made user data
adminmadeuserroutes.post("/updateadmindata",updateuserdata)
//delete admin data made by super admin
adminmadeuserroutes.post("/deleteadmindata",delete_user_profile)
//update a role and input the user id to the role
adminmadeuserroutes.post("/createuserrole",associateRoleToUser)
//get all role route
adminmadeuserroutes.get("/getallroles",get_all_roles)
//update a role according to the user
adminmadeuserroutes.post("/updaterole",update_user_role_details)
//get a role associated with the user 
adminmadeuserroutes.post("/getroleanduser",get_user_by_role)
// create a role to be assign later for the user
adminmadeuserroutes.post("/createrole",createlistofroles)
//delete role from the database
adminmadeuserroutes.post("/deleterole",delete_a_role)
//logout a user
adminmadeuserroutes.post("/logoutusers",adminUserLogout)
//create financial details and stored data into database
adminmadeuserroutes.post("/createfins",add_user_financial_details)
//get all fincancial details

adminmadeuserroutes.get("/getallfindata",getallfinancialdetails)
export default adminmadeuserroutes;