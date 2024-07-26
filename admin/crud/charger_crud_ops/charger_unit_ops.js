//all of charger related crud operatoins hasbeen written inside this file

import { PrismaClient } from "@prisma/client";
import generateRandomUID from "../../../lib/generaterandomuid.js";
const prisma = new PrismaClient();


const asssign_buy_charger = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      return res.status(403).json({ message: "API route access forbidden" });
  }
    //all of the chargers which are bought by the signle user  or multiple users together
    const {ChargerName,Chargerhost,Segment,Subsegment,Total_Capacity,Chargertype,parking,number_of_connectors,Connector_type,connector_total_capacity,
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
        if(!newChargerUnit){
            return res.status(503).json("Charger operations not available at this moment")
        }
        return res.status(201).json("Charger unit hasbeen created successfully")
    } catch (error) {
        console.log(error)
        res.status(500).json({error:`An error occurred while processing ${error}`})
    }
}

export default asssign_buy_charger

