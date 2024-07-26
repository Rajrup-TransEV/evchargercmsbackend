//list the all charges 

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const get_all_charger= async(req,res)=>{
    try {
        
        const get_all_charger_assigned=await prisma.charger_Unit.findMany()
        if(!get_all_charger_assigned){
            return res.status(503).json("something went worng please try again soon")
        }
        return res.status(200).json(get_all_charger_assigned)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
    
    }
    
    export default get_all_charger