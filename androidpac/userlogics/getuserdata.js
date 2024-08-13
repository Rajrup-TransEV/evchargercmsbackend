//get all of the data of nominal users
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const allnormaluserdata = async(req,res)=>{
try {
    const normaluserdata = await prisma.user.findMany()
        if(!normaluserdata){
            return  res.status(404).json({message:"error there is no data to show"})
        }
        return res.status(200).json({data:normaluserdata})
} catch (error) {
    console.log(`error ${error}`)
}
}
export default allnormaluserdata