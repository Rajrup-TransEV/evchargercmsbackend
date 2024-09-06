//all of charger related crud operatoins hasbeen written inside this file

import { PrismaClient } from "@prisma/client";
import generateRandomUID from "../../../lib/generaterandomuid.js";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";
import qrcode from "qrcode";
import saveqrcode from "../../../lib/saveqrcode.js";
const prisma = new PrismaClient();


const asssign_buy_charger = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "charger_unit_ops.js"
        logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
    //all of the chargers which are bought by the signle user  or multiple users together
    const {Chargerserialnum,ChargerName,Chargerhost,Segment,Subsegment,Total_Capacity,Chargertype,parking,number_of_connectors,Connector_type,connector_total_capacity,
        lattitude,longitute,full_address,charger_use_type,twenty_four_seven_open_status,charger_image,chargerbuyer
    }=req.body;
    //null exception handeling 
    if(Chargerserialnum===""||ChargerName===""||Chargerhost===""||Segment===""||Subsegment===""||Total_Capacity===""||Chargertype===""||parking===""||number_of_connectors===""||Connector_type===""||connector_total_capacity===""||
        lattitude===""||longitute===""||full_address===""||charger_use_type===""||twenty_four_seven_open_status===""||chargerbuyer===""
    ){
        const messagetype = "error"
        const message = "Required fields are not given please fillup all the fields"
        const filelocation = "charger_unit_ops.js"
        logging(messagetype,message,filelocation)
        return res.status(400).json({message:"Required fields are not given please fillup all the fields"})
    }
       
    const ranuid  = generateRandomUID()
    try {
             // Validate the input data
             if (!chargerbuyer) {
                return res.status(400).json({ error: 'Charger buyer email is required' });
             }
        const usersearch= await prisma.userProfile.findFirst({
            where:{
                email:chargerbuyer
            },select:{
                uid:true
            }
        })
        const newChargerUnit = await     prisma.charger_Unit.create({
            data:{
                Chargerserialnum,
                ChargerName,
                uid:ranuid,
                Chargerhost,
                Segment,
                Subsegment,
                Total_Capacity,
                Chargertype,
                parking,
                number_of_connectors,
                Connector_type,
                connector_total_capacity,
                lattitude,
                longitute,
                full_address,
                charger_use_type,
                twenty_four_seven_open_status,
                charger_image,
                userId:usersearch.uid
            }
        })
        // const charger_unit_app = await fetch("/")
        if(!newChargerUnit){
            
            const messagetype = "error"
            const message = "Charger operations not available at this moment"
            const filelocation = "charger_unit_ops.js"
            logging(messagetype,message,filelocation)
            return res.status(503).json("Charger operations not available at this moment")
        }
        const associateuserfetch = await prisma.userProfile.findFirstOrThrow({
            where:{
                email:chargerbuyer
            },
            select:{
                email:true,
                firstname:true
            }
        })
        if(!associateuserfetch){
            const messagetype = "error"
            const message = "User not found asked for charger"
            const filelocation = "charger_unit_ops.js"
            logging(messagetype,message,filelocation)
            return res.status(404).json("User not found asked for charger")
        }
        const to =  associateuserfetch.email
        const subject = "Thank you for buying a charger"
       const text = `Hello  -  ${associateuserfetch.firstname} Thanks for ordering a new charger \n
        your order details are :-
        Charger name  - ${ChargerName} \n
        Chargerhost - ${Chargerhost} \n
          Segment    - ${Segment} \n
          Subsegment - ${Subsegment} \n
          Total_Capacity - ${Total_Capacity} \n
          Chargertype- ${Chargertype} \n
          parking - ${parking} \n
          number_of_connectors - ${number_of_connectors} \n
          Connector_type - ${Connector_type} \n
          connector_total_capacity - ${connector_total_capacity} \n
          lattitude -  ${lattitude} \n
          longitute - ${longitute} \n
          full_address - ${full_address} \n
          charger_use_type - ${charger_use_type} \n
          twenty_four_seven_open_status - ${twenty_four_seven_open_status} \n
        `
          // Add the email job to the queue
          console.log('Adding email job to queue:', { to, subject, text });
          await emailQueue.add({ to, subject, text }, {
              attempts: 5, // Number of retry attempts
              backoff: 10000 // Wait 10 seconds before retrying
          });
       
          const messagetype = "success"
          const message = "Charger unit hasbeen created successfully"
          const filelocation = "charger_unit_ops.js"
          logging(messagetype,message,filelocation)
          //qrcode generation logic
        const qrcodedata = `${ranuid}`
        const qrcodeBuffer = await saveqrcode(qrcodedata)
        console.log(qrcodeBuffer)
        const normalizedQrcodePath = qrcodeBuffer.qrCodePath.replace(/\\/g, '/');
            const saveqrcodedata = await prisma.qRCode.create({
                data:{
                    uid:crypto.randomUUID(),
                    chargerid:qrcodedata,
                    qrcodedata:normalizedQrcodePath
                },
                select:{
                    qrcodedata:true
                }
            })
        
        const chargerocppur="ws://srv586896.hstgr.cloud"+"/"+`${ranuid}`    
        return res.status(201).json({message:"Charger unit hasbeen created successfully",ocppurl:chargerocppur})
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `${error}`
        const filelocation = "charger_unit_ops.js"
        logging(messagetype,message,filelocation)
        res.status(500).json({message:'An error occurred while processing',error:`${error}`})
    }
}

export default asssign_buy_charger