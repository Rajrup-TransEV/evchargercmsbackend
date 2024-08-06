// vehicle creation logic .
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const vehilcle_create = async(req,res)=>{
    const {uid,vehiclename,vehiclemodel,vehiclelicense,vehicleowner,vehicletype,vehiclecategory} = req.body;

   
    try {
        const vehicledatamatch = await prisma.assigntovechicles.findFirst({
            where:{
                    vehiclelicense:vehiclelicense
            },select:{
                vehiclelicense:true
            }
        })
        if (vehicledatamatch){
            return res.status(409).json({message:`A vehicle with the same license already exists`})
        }
        const vehicledatacreate  = await prisma.assigntovechicles.create({
               data:{
                uid:crypto.randomUUID(),
                vehiclename:vehiclename,
                vehiclemodel:vehiclemodel,
                vehiclelicense:vehiclelicense,
                vehicleowner:vehicleowner,
                vehicletype:vehicletype,
                vehiclecategory:vehiclecategory,
               }
        })
        
        if(!vehicledatacreate){
            return res.status(503).json({message:`There is something wrong`})
        }
        return res.status(200).json({message:"Vehicle data has successfully saved"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:error})
    }
}

export default vehilcle_create;