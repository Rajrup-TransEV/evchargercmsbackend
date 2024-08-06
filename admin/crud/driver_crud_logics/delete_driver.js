// delete a driver from database
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const deletevehicleowener = async(req,res)=>{
    const {uid,email} =  req.body;

    try {
        const deletedriver  = await prisma.assigntovehicleowener.delete({
            where:{
                OR:[
                    {uid:uid},
                    {vehicleoweneremail:email}
                ]
            }
        })
        if(!deletedriver){
                return res.status(400).json({message:"Bad request the user is not present"})
        }
        return res.status(200).json({message:"user hasbeen deleted succesfully"})
    } catch (error) {
        console.log(error)
        return res.staus(500).json({message:error})
    }
   
}