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
// import chargerstarttransactions from "../controller/crud/chargeroperations/chargerstart.js"
import createminthreshhold from "../controller/crud/min_threshhold/createthreshhold.js"
import feedbackcreate from "../controller/crud/feedbackops/feedbackcreate.js"
import listoffeedbacks from "../controller/crud/feedbackops/feedbacklist.js"
import feedbackdetailbyid from "../controller/crud/feedbackops/feedbackdetailbyid.js"
import feedbackbyadminid from "../controller/crud/feedbackops/feedbackbyadminid.js"
import feedbackdelete from "../controller/crud/feedbackops/feedbackdelete.js"
import faqlist from "../controller/crud/faqops/faqlist.js"
import faqopscreate from "../controller/crud/faqops/faqops.js"
import faqupdate from "../controller/crud/faqops/faqupdate.js"
import faqdelete from "../controller/crud/faqops/faqdelete.js"
import getfaqbyid from "../controller/crud/faqops/faqid.js"
import listofcontactform from "../controller/crud/contactform/listofcontactform.js"
import contactform from "../controller/crud/contactform/contactformops.js"
import contactmessagebyid from "../controller/crud/contactform/getcfbyid.js"
import contactmessagedelete from "../controller/crud/contactform/contactmessagedelete.js"
import checktransaction from "../controller/crud/chargeroperations/checktransation.js"
import setChargerOperative from "../controller/crud/chargeroperations/chargeroperaive.js"
import setChargerOn from "../controller/crud/chargeroperations/chop.js"
import setChargerStart from "../controller/crud/chargeroperations/chargerstart.js"
import deductcalculate from "../controller/crud/chargeroperations/deductcalculate.js"
import checkstartresponse from "../controller/crud/chargeroperations/checkstartresponse.js"
import getchargingsessionbyuserid from "../controller/crud/chargingsessions/getchargingsessionbyuserid'.js"
import chargerstop from "../controller/crud/chargeroperations/chargerstop.js"
// import createminrate from "../controller/crud/min_threshhold/createminrate.js"
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
//charger check transaction
userRoutes.post("/checktransaction",checktransaction)
//set charger operative
userRoutes.post("/chargeroperative",setChargerOperative)
//set charger stop
userRoutes.post("/chargerstop",chargerstop)
//set charger on
userRoutes.post("/setchargeron",setChargerOn)
//set minimum balance route
userRoutes.post("/createmb",createminthreshhold)
//feedback create
userRoutes.post("/fbgen",feedbackcreate)
//listof feedback
userRoutes.get("/liofdbck",listoffeedbacks)
//get feedback form by id
userRoutes.post("/getfeedbackformbyid",feedbackdetailbyid)
//get feedback by adminid
userRoutes.post("/fedbadmn",feedbackbyadminid)
//delete feedback
userRoutes.post("/fedbkdel",feedbackdelete)
//faq create
userRoutes.post("/faqcreate",faqopscreate)
//get user list
userRoutes.get("/faqlist",faqlist)
//faqupdate
userRoutes.post("/faqupdate",faqupdate)
//faqdelete
userRoutes.post("/faqdelete",faqdelete)
//get faq by id
userRoutes.post("/faqbyid",getfaqbyid)
//list of contact form
userRoutes.get("/listofcontactform",listofcontactform)
//contact form create
userRoutes.post("/cfcr",contactform)
//getcfbyid
userRoutes.get("/getcfbyid",contactmessagebyid)
//contact message delete
userRoutes.post("/deletecm",contactmessagedelete)
//set charger on
userRoutes.post("/chargeron",setChargerOn)
//set charger start
userRoutes.post("/chargerstart",setChargerStart)
//check start response
userRoutes.post("/checkstartresponse",checkstartresponse)
//deduct calculate
userRoutes.post("/deductcalculate",deductcalculate)
//get charging session by user id
userRoutes.post("/chargingsessionbyuserid",getchargingsessionbyuserid)
//create min rate
// userRoutes.post("/createminrate",createminrate)
export default userRoutes;