//see how list of drivers available in database
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const getalldrivers = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        return res.status(403).json({ message: "API route access forbidden" });
    }
    try {
        const getdatafromdb = await prisma.assigntovehicleowener.findMany()
        if (!getdatafromdb){
            return res.status(404).json({message:`the is no data associated with this vehicle owener`})
        }
        return res.status(200).json({data: getdatafromdb})
    } catch (error) {
        console.log(error)
        const getdatafromdb = await prisma.assigntovehicleowener.findMany()
        if (!getdatafromdb){
            return res.status(500).json({message:`${error}`})
        }
    }
}
export default getalldrivers