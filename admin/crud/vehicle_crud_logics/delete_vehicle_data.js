//delete a vehilce data from database 
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const deleteavehicledata = async(req,res)=>{
    const {uid,license,vehicleowenerId}=req.body;
    try {
        const matchdata = await prisma.assigntovechicles.deleteMany({
            where:{
                OR:[
                    {uid:uid},
                    {vehicleowenerId:vehicleowenerId},
                    {vehiclelicense:license}
                ]
            }
        })

        if(!matchdata){
            return res.status(400).json({message:"No associate vehile found or already deleted"})
        }
        return res.status(200).json({message:"Data hasbeen deleted successfully"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:`${error}`})
    }
    
}

export default deleteavehicledata