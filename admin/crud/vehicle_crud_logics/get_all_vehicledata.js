//get all of the vehicle stored inside the database
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const get_all_vehicles = async(req,res)=>{
    try {
        const listofvehilcles = await prisma.assigntovechicles.findMany()
        return res.status(200).json({data:listofvehilcles})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:error})
    }
}

export default get_all_vehicles