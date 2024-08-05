// register a new driver 
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const createdriver = async(req,res)=>{
 
    const {uid,driverfirstname,driverlastename,driveremail,driverlicense,drivergovdocs,drivernationality,diverid,driveraddress,drirole} = req.body;
    
    try {
        const getdriveremail = await prisma.assigntoDriver.findFirst({
            where:{
                OR:[
                    {uid:uid},
                    {driveremail:driveremail},
                    {driverlicense:driverlicense}
                ]
                
            },select:{
                driveremail:true,
                driverlicense:true
            }
        })
    
        if(getdriveremail){
            return res.status(409).json("Driver is already register please use another email")
        }
        const roleRegex = /^vehicleowener$/i; // Matches "driver" in a case-insensitive manner
        console.log(drirole)
        console.log(roleRegex.test(drirole))
        if (!roleRegex.test(drirole)) {
            return res.status(403).json({ message: `Vehicle owener can have only 'vehicleowener' role assigned, nothing else` });
        }
        const create_driver_data = await prisma.assigntoDriver.create({
            data:{
                uid:crypto.randomUUID(),
                driverfirstname:driverfirstname,
                driverlastename:driverlastename,
                driveremail:driveremail,
                driverlicense:driverlicense,
                drivergovdocs:drivergovdocs,
                drivernationality:drivernationality,
                driverid:diverid,
                driveraddress:driveraddress,
                driverrole:drirole
            }
        })
    
        if(!create_driver_data){
            return res.status(503).json("there is something wrong while create the driver ")
        }

        return res.status(200).json("Information hasbeen saved and driver has created successfully")
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:`Something went wrong please check error details ${error}`})
    }
   
}

export default createdriver;