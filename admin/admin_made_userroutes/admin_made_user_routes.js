import { Router } from "express"
// import {admincreateuser} from "
import admincreateuser from "../admin_to_user_profile/admin_to_user_profile_create.js"
const adminmadeuserroutes = Router()

adminmadeuserroutes.post("/create/userprofilecreate",admincreateuser)

export default adminmadeuserroutes;