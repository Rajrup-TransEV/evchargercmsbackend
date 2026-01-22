//super admin can able to generate admin below is the wirtten logic
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";
import validateEmailrecep from "../../../lib/emailrecepverify.js";
import { getCache, setCache } from "../../../utils/cacheops.js";
import generateCustomRandomUID from "../../../lib/customuids.js";


const prisma = new PrismaClient()

 const admincreateuser = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
      // Check if the API key is valid
      if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "admin_to_user_profile_create.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const {firstname,lastname,email,phonenumber,password,role,designation,address}= req.body;

    if(firstname === ""|| lastname===""||phonenumber==="" ||email==="" || password===""|| role===""|| designation===""|| address===""){
      const messagetype = "error"
      const message = "No value provided for one or more fields."
      const filelocation = "admin_to_user_profile_create.js"
      logging(messagetype,message,filelocation)
        return res.status(400).json({ error: 'No value provided for one or more fields.' });
      }
    
    try {
      //check the data from redis cache first then look somewhere else
      // const cacheddata =  await getCache("userprofileemail");
      // if(cacheddata){
      //   const messagetype = "success";
      //   const message = "Data retrieved from cache";
      //   const filelocation = "get_admin_data_by_email.js";
      //   logging(messagetype, message, filelocation);
      //   return res.status(200).json({
      //     message:"Requested data is", data:cacheddata
      //   })
      // }
    //if not cache then query the data from database
        const findExistingUser = await prisma.userProfile.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phonenumber: phonenumber }
                ]
            },
            select: {
                email: true,
                phonenumber: true
            }
        });
        // await setCache("userprofileemail",findExistingUser,3600)
        if (findExistingUser){
            const messagetype = "error"
            const message = "One of user's details already exists , email ,phone"
            const filelocation = "admin_to_user_profile_create.js"
            logging(messagetype,message,filelocation)
            return res.status(409).json({message:"One of user's details already exists , email ,phone"})
        }
        const hashedPassword = await bcrypt.hash(password, 10); 
        const createadminprofile = await prisma.userProfile.create({
            data:{
                uid:generateCustomRandomUID(),
                firstname:firstname,
                lastname:lastname,
                email:email,
                phonenumber:phonenumber,
                password:hashedPassword,
                role:role,
                designation:designation,
                address:address
            }
        })
        //perday user creation count
        const today = new Date().toISOString().split('T')[0];
        const todayDate = new Date(today);
        try {
             // Find or create daily signup record
        const existingSignupRecord = await prisma.dailySignup.findFirst({
            where: {
            date: new Date(todayDate)
            }
        });
        if (existingSignupRecord) {
            // Update the existing record
            await prisma.dailySignup.update({
              where: {
                id: existingSignupRecord.id
              },
              data: {
                newSignupCount: {
                  increment: 1
                }
              }
            });
          } else {
            // Create a new record for today
            await prisma.dailySignup.create({
              data: {
                uid:crypto.randomUUID(),
                date: new Date(todayDate),
                newSignupCount: 1
              }
            });
          }
            const messagetype = "success"
            const message = `analaytics for daily user count has been added`
            const filelocation = "admin_to_user_profile_create.js"
            logging(messagetype,message,filelocation)
        } catch (error) {
            console.log(error)
            const messagetype = "error"
            const message = `something went wrong with the server:: ${error}`
            const filelocation = "admin_to_user_profile_create.js"
            logging(messagetype,message,filelocation)
        }
        if(!createadminprofile){
            const messagetype = "error"
            const message = "user creation failed"
            const filelocation = "admin_to_user_profile_create.js"
            logging(messagetype,message,filelocation)
            return res.statu(503).json({message:"user creation failed"})
        }
        const loginUrl = `${process.env.DASHBOARD_URL}/login`;
        const to=email
        const subject  = "Your email and password for login in service"
        const text = `Hello - ${firstname} Your email is - ${email} and password is -> ${password} for login to the dashboard, your role is - ${role} . Thanks for choosing our service`
        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Account Credentials</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <tr>
            <td style="background:#4ADE80; padding:22px; text-align:center;">
              <h2 style="margin:0; color:#064e3b;">Welcome Aboard!</h2>
            </td>
          </tr>

          <tr>
            <td style="padding:30px; color:#333;">
              <p style="font-size:15px;">
                Hello <strong>${firstname} ${lastname}</strong>,
              </p>

              <p style="font-size:14px; line-height:1.6;">
                Your account has been successfully created. Please find your login credentials below:
              </p>

              <table width="100%" cellpadding="12" cellspacing="0"
                     style="background:#FFFBEB; border:1px solid #FDE047; border-radius:6px; margin:22px 0;">
                <tr><td><strong>Email:</strong> ${email}</td></tr>
                <tr><td><strong>Phone Number:</strong> ${phonenumber}</td></tr>
                <tr><td><strong>Password:</strong> ${password}</td></tr>
                <tr><td><strong>Role:</strong> ${role}</td></tr>
              </table>

              <p style="font-size:14px;">
                For security reasons, we recommend changing your password after your first login.
              </p>

              <p style="font-size:14px;">
                If you need assistance, feel free to contact our support team.
              </p>

              <p style="font-size:14px;">
                Best regards,<br>
                <strong>Team Transmogrify Global Pvt Ltd</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#FDE047; padding:14px; text-align:center;
                       font-size:12px; color:#78350f;">
              © 2025 Transmogrify Global Pvt Ltd. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Add the email job to the queue
    console.log('Adding email job to queue:', { to, subject, text, html });
    await emailQueue.add({ to, subject, text, html }, {
        attempts: 5, // Number of retry attempts
        backoff: 10000 // Wait 10 seconds before retrying
    });
    const messagetype = "success"
    const message = `User hasbeen created successfully please check your email for the login details`
    const filelocation = "admin_to_user_profile_create.js"
    logging(messagetype,message,filelocation)
        return res.status(201).json({message:"User hasbeen created successfully please check your email for the login details"})
    } catch (err) {
        const messagetype = "error"
        const message = `something went wrong with the server:: ${err}`
        const filelocation = "admin_to_user_profile_create.js"
        logging(messagetype,message,filelocation)
     return res.status(500).json({message:`something went wrong with the server`,error:err})   
    }
}

export default admincreateuser