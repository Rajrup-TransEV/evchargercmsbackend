//super admin can able to generate admin below is the wirtten logic
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";
import validateEmailrecep from "../../../lib/emailrecepverify.js";


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
   
    if(validateEmailrecep(email)){
      const messagetype = "error"
      const message = "You're using a bot email - supported email ext - gmail , outlook , protonmail"
      const filelocation = "admin_to_user_profile_create.js"
      logging(messagetype,message,filelocation)
      return res.status(400).json({message:"You're using a bot email - supported email ext - gmail , outlook , protonmail"})
    }
    if(firstname === ""|| lastname===""||phonenumber==="" ||email==="" || password===""|| role===""|| designation===""|| address===""){
      const messagetype = "error"
      const message = "No value provided for one or more fields."
      const filelocation = "admin_to_user_profile_create.js"
      logging(messagetype,message,filelocation)
        return res.status(400).json({ error: 'No value provided for one or more fields.' });
      }
    
    try {
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
                uid:crypto.randomUUID(),
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
        const to=email
        const subject  = "Your email and password for login in service"
        const text = `Hello - ${firstname} Your email is - ${email} and password is -> ${password} for login to the dashboard, your role is - ${role} . Thanks for choosing our service`
    // Add the email job to the queue
    console.log('Adding email job to queue:', { to, subject, text });
    await emailQueue.add({ to, subject, text }, {
        attempts: 5, // Number of retry attempts
        backoff: 10000 // Wait 10 seconds before retrying
    });
    const userData = {
        uid: createadminprofile.uid,
        firstname: createadminprofile.firstname,
        lastname: createadminprofile.lastname,
        email: createadminprofile.email,
        phonenumber: createadminprofile.phonenumber,
        role: createadminprofile.role,
        designation: createadminprofile.designation,
        address: createadminprofile.address
    };
    // const externaluri = process.env.EXTERNAL_URI
    // const concaturi = externaluri + "/users"
    // try {
    //     const response = await fetch(`${concaturi}`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(userData)
    //     });
        
    //     if (!response.ok) {
    //         const errorData = await response.json();
    //         const messagetype = "error"
    //         const message = "Error sending data to Flask API:"
    //         const filelocation = "admin_to_user_profile_create.js"
    //         logging(messagetype,message,filelocation)
    //         console.error('Error sending data to Flask API:', errorData.error);
    //     } else {
    //         const createdUser = await response.json();
    //         const messagetype = "success"
    //         const message = "User created in Flask:"
    //         const filelocation = "admin_to_user_profile_create.js"
    //         logging(messagetype,message,filelocation)
    //         console.log('User created in Flask:', createdUser);
    //     } 
    // } catch (error) {
    //     const messagetype = "success"
    //     const message = `message:"api endpoint is down -> still userdata hasbeen generated ",error:${error}`
    //     const filelocation = "admin_to_user_profile_create.js"
    //     logging(messagetype,message,filelocation)
    //     return res.status(201).json({message:"api endpoint is down still userdata hasbeen generated ",error:error})
    // }
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
     return res.status(500).json({message:`something went wrong with the server:: ${err} `})   
    }
}

export default admincreateuser