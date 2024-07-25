import { Router } from "express"
// import {admincreateuser} from "
import admincreateuser from "../admin_to_user_profile/admin_to_user_profile_create.js"
import adminuserlogin from "../admin_made_userauth/signin/signin.js"
const adminmadeuserroutes = Router()

adminmadeuserroutes.post("/create/userprofilecreate",admincreateuser)
adminmadeuserroutes.post("/login/userlogin",adminuserlogin)

export default adminmadeuserroutes;