//fetch all admin user data created by superuser
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const alladminuserdata=async (req,res)=>{
    console.log("get response receiving")
    try {
        console.log("try catch block running")
        const fetchalldata = await prisma.userProfile.findMany()
        console.log(fetchalldata)
        if(!fetchalldata){
            return res.status(503).json("There is not much data to show")
        }
        return res.status(200).json(fetchalldata)
    } catch (error) {
        console.log(error)
     return res.status(500).json(error)   
    }
}

export default alladminuserdata;