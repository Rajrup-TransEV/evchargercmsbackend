//all of charger related crud operatoins hasbeen written inside this file

import { PrismaClient } from "@prisma/client";
import generateRandomUID from "../../../lib/generaterandomuid.js";
import emailQueue from "../../../lib/emailqueue.js";
const prisma = new PrismaClient();


const asssign_buy_charger = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      return res.status(403).json({ message: "API route access forbidden" });
  }
    //all of the chargers which are bought by the signle user  or multiple users together
    const {Chargerserialnum,ChargerName,Chargerhost,Segment,Subsegment,Total_Capacity,Chargertype,parking,number_of_connectors,Connector_type,connector_total_capacity,
        lattitude,longitute,full_address,charger_use_type,twenty_four_seven_open_status,charger_image,chargerbuyer
    }=req.body;
       
    const ranuid  = generateRandomUID()
    try {
             // Validate the input data
             if (!chargerbuyer) {
                return res.status(400).json({ error: 'Charger buyer UID is required' });
             }
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
                userId:chargerbuyer
            }
        })
        // const charger_unit_app = await fetch("/")
        if(!newChargerUnit){
            return res.status(503).json("Charger operations not available at this moment")
        }
        const associateuserfetch = await prisma.userProfile.findFirstOrThrow({
            where:{
                uid:chargerbuyer
            },
            select:{
                email:true,
                firstname:true
            }
        })
        if(!associateuserfetch){
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
          
        return res.status(201).json("Charger unit hasbeen created successfully")
    } catch (error) {
        console.log(error)
        res.status(500).json({error:`An error occurred while processing ${error}`})
    }
}

export default asssign_buy_charger

