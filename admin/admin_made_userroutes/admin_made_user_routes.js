//admin users routes all routes which created by super user hasbeen assigned here
import { Router } from "express"
import adminuserlogin from "../admin_made_userauth/signin/signin.js"
import asssign_buy_charger from "../crud/charger_crud_ops/charger_unit_ops.js"
import alladminuserdata from "../crud/admin_made_user_cruds/fetch_all_admin_data.js"
import get_all_charger from "../crud/charger_crud_ops/get_all_charger_unit_ops.js"
import edit_charger_details from "../crud/charger_crud_ops/edit_chargerunit.js"
import delete_charger_units from "../crud/charger_crud_ops/delete_charger_units.js"
import user_who_bought_the_charger_details from "../crud/charger_crud_ops/user_who_bought_which_charger.js"
import updateuserdata from "../crud/admin_made_user_cruds/update_admin_made_users.js"
import delete_user_profile from "../crud/admin_made_user_cruds/delete_admin_made_users.js"
import get_all_roles from "../crud/admin_to_user_role_assignment/get_all_of_the_role.js"
import update_user_role_details from "../crud/admin_to_user_role_assignment/update_a_role_details.js"
import get_user_by_role from "../crud/admin_to_user_role_assignment/get_user_details_by_role.js"
import createlistofroles from "../crud/admin_to_user_role_assignment/role_create_main.js"
import associateRoleToUser from "../crud/admin_to_user_role_assignment/role_assignment_create.js"
import delete_a_role from "../crud/admin_to_user_role_assignment/delete_a_role.js"
import adminUserLogout from "../admin_made_userauth/signin/logout.js"
import add_user_financial_details from "../crud/financial_details/create_admin_financial_details.js"
import getallfinancialdetails from "../crud/financial_details/get_all_financial_details.js"
import updatefinancialdata from "../crud/financial_details/update_financial_details.js"
import getfindatawithuser from "../crud/financial_details/financial_data_with_users.js"
import admincreateuser from "../crud/admin_made_user_cruds/admin_to_user_profile_create.js"
import passwordresetlogic from "../admin_made_userauth/signin/passwordreset.js"
import verifyOtpLogic from "../admin_made_userauth/signin/verifyOTP.js"
import resetPasswordLogic from "../admin_made_userauth/signin/resetPasswordlogic.js"
import createdriver from "../crud/driver_crud_logics/driver_create.js"
import getalldrivers from "../crud/driver_crud_logics/get_all_drivers.js"
import updateVehicleOwnerData from "../crud/driver_crud_logics/update_driver.js"
import vehicle_assign from "../crud/vehicle_crud_logics/vehicle_assign.js"
import vehilcle_create from "../crud/vehicle_crud_logics/vehicle_create.js"
import get_all_vehicles from "../crud/vehicle_crud_logics/get_all_vehicledata.js"
import update_vehicle_details from "../crud/vehicle_crud_logics/update_vehicle_details.js"
import deleteavehicledata from "../crud/vehicle_crud_logics/delete_vehicle_data.js"
import retrive_vehicle_owener_data_by_email from "../crud/driver_crud_logics/get_driver_by_emai_id.js"
import deletevehicleowener from "../crud/driver_crud_logics/delete_driver.js"
import create_wallet_details from "../crud/wallet_crud/create_wallet_details.js"
import get_all_wallet_data from "../crud/wallet_crud/get_wallet_data.js"
import rechargewallet from "../crud/wallet_crud/init_wallet_recharger.js"
import edit_wallet from "../crud/wallet_crud/edit_a_wallet_details.js"
import deletewalletdata from "../crud/wallet_crud/delete_wallet.js"
import get_all_wallet_recharge_history from "../crud/wallet_recharge_history/get_all_wallet_recharge_history.js"
import find_wh_o_s_w from "../crud/wallet_recharge_history/wall_history_for_asingle_user.js"
import get_all_logs from "../../logging/get_all_stored_log.js"
import get_single_admin_data from "../crud/admin_made_user_cruds/get_admin_data_by_email.js"
import getsingledetails from "../crud/charger_crud_ops/getsinglechargerdetails.js"
import upload from "../../lib/uploadMiddleware.js"
import getdriverbyadminid from "../crud/driver_crud_logics/get_driver_list_by_adminid.js"
import addhub from "../crud/hub_crud/addhub.js"
import GetAllHubdata from "../crud/hub_crud/getallhubdata.js"
import gahuaa from "../crud/hub_crud/get_all_hubs_under_a_admin.js"
import GetSingleHubDetails from "../crud/hub_crud/get_single_hub_details.js"
import verifyPayment from "../crud/razor_pay_crud/verifypayment.js"
import totalrevenue from "../crud/wallet_crud/totalrevenue.js"
import gettransactions from "../crud/razor_pay_crud/payment_data.js"
import { todayrevenue } from "../crud/wallet_crud/today_recharge.js"
import { monthlyRevenue } from "../crud/wallet_crud/monthly_recharge.js"
import { yearlyRevenue } from "../crud/wallet_crud/yearly_recharge.js"
const adminmadeuserroutes = Router()
//create admin made by super admin
adminmadeuserroutes.post("/create/userprofilecreate",admincreateuser)
//super usermade login endpoint
adminmadeuserroutes.post("/login/userlogin",adminuserlogin)
//charger using buy assign
adminmadeuserroutes.post("/createchargerunit",asssign_buy_charger)
//get all of the super admin made admin data through route
adminmadeuserroutes.get("/getalladmindata",alladminuserdata)
//get admin by email
adminmadeuserroutes.post("/getadminbyemail",get_single_admin_data)
//all of the charger list data
adminmadeuserroutes.get("/listofcharges",get_all_charger)
//edit charger details one by one
adminmadeuserroutes.post("/editchargerdetails",edit_charger_details)
//delete charger details one by one
adminmadeuserroutes.post("/deletechargerunits",delete_charger_units)
// which user bought which charger that details
adminmadeuserroutes.post("/getchargerbyuserid",user_who_bought_the_charger_details)
//get single charger details
adminmadeuserroutes.post("/getsinglechargerdetails",getsingledetails)
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
//update financial data
adminmadeuserroutes.post("/updatefindata",updatefinancialdata)
//get user data associated 
adminmadeuserroutes.post("/findataofauser",getfindatawithuser)
//send password reset email via api endpoint 
adminmadeuserroutes.post("/resetadminpassword",passwordresetlogic)
//verify password reset opt logic
adminmadeuserroutes.post("/pwresetverifyotp",verifyOtpLogic)
//password reset logic route
adminmadeuserroutes.post("/respassword",resetPasswordLogic)
//create a driver or  user can self assign them as a driver
adminmadeuserroutes.post("/createdriver",createdriver)
// get the list of vehicleoweners
adminmadeuserroutes.get("/getallvehicleowener",getalldrivers)
//get a specific user by email
adminmadeuserroutes.post("/getvobye",retrive_vehicle_owener_data_by_email)
//update all of driver specific data
adminmadeuserroutes.post("/updatedriverdata",updateVehicleOwnerData)
//delete vehicle owener
adminmadeuserroutes.post("/deletevo",deletevehicleowener)
//get vehicle owener by admin id
adminmadeuserroutes.post("/getvobyaid",getdriverbyadminid)
//vehicle create
adminmadeuserroutes.post("/createav",vehilcle_create)
//vehcile assign to user logics
adminmadeuserroutes.post("/assignvtod",vehicle_assign.assignVehicleToDriver)
//user to vehicle assign a driver to a vehilce
adminmadeuserroutes.post("/assigndtov",vehicle_assign.assignDriverToVehicle)
//get all of the vehicles
adminmadeuserroutes.get("/listofvehicle",get_all_vehicles)
//update vehicle details
adminmadeuserroutes.post("/updatevehicledetails",update_vehicle_details)
//delete a vehicle
adminmadeuserroutes.post("/deleteavehicle",deleteavehicledata)
//wallet crud
//createwallet
adminmadeuserroutes.post("/createuserwallet",create_wallet_details)
//get all wallet
adminmadeuserroutes.get("/allwalletdata",get_all_wallet_data)
//init wallet recharge
adminmadeuserroutes.post("/initwalletrecharge",rechargewallet)
//edit wallet 
adminmadeuserroutes.post("/editwalletdata",edit_wallet)
//delete wallet 
adminmadeuserroutes.post("/deletewalletdata",deletewalletdata)
//get all wallet recharge history
adminmadeuserroutes.get("/getallwalletrechargehistory",get_all_wallet_recharge_history)
//verifypayment
adminmadeuserroutes.post("/verifypayment",verifyPayment)
//get wallet history for a perticular user
adminmadeuserroutes.post("/find_wh_o_s_w",find_wh_o_s_w)
//get all log data
adminmadeuserroutes.get("/getalllogs",get_all_logs)
//add hub
adminmadeuserroutes.post("/addhubs",addhub)
//get all hub data
adminmadeuserroutes.get("/allhubs",GetAllHubdata)
//get hub under a admin
adminmadeuserroutes.post("/gahuaa",gahuaa)
//get a hub details by id
adminmadeuserroutes.post("/singlehub",GetSingleHubDetails)
//transactions get the total revenue
adminmadeuserroutes.post("/totalrevenue",totalrevenue)
//get all transactions details
adminmadeuserroutes.post("/alltsdetails",gettransactions)
//get todays total revenue
adminmadeuserroutes.get("/todayrev",todayrevenue)
//monthly recharge revenue
adminmadeuserroutes.get("/monthlyrev",monthlyRevenue)
//yearly recharge revenue
adminmadeuserroutes.get("/yearlyrev",yearlyRevenue)
export default adminmadeuserroutes;