// register a new driver 
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const createdriver = async(req,res)=>{
 
    const {driverfirstname,driverlastename,driveremail,driverlicense,drivergovdocs,drivernationality,diverid,driveraddress} = req.body;
    
    const getdriveremail = await prisma.assigntoDriver.findFirstOrThrow({
        where:{
            driveremail:driveremail
        },select:{
            driveremail:true
        }
    })
    
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
            driveraddress:driveraddress
        }
    })
}