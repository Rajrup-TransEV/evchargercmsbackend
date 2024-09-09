// 

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getsingledetails = async(req,res)=>{
    const {chargeruid} = req.body

    const chargerdataforch = await prisma.charger_Unit.findUnique({
        where:{
            uid:chargeruid
        },select:{
            QRCode:true,
            uid:true,
            Chargerserialnum:true,
            ChargerName:true,
            Chargerhost:true,
            Segment:true,
            Subsegment:true,
            Total_Capacity:true,
            Chargertype:true,
            parking:true,
            number_of_connectors:true,
            Connector_type:true,
            connector_total_capacity:true,
            lattitude:true,
            longitute:true,
            full_address:true,
            charger_use_type:true,
            twenty_four_seven_open_status:true,
            charger_image:true,
            chargerbuyer:true,
        }
    })

    const qrcodedata = await prisma.qRCode.findFirst({
        where:{
            chargerid:chargeruid
        },select:{
            qrcodedata:true
        }
    })
    
    
}
export default getsingledetails