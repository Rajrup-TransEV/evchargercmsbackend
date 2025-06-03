// import { PrismaClient } from "@prisma/client";
// import logging from "../../../../logging/logging_generate.js";
// import generateCustomRandomUID from "../../../../lib/customuids.js";

// const prisma = new PrismaClient();

// const Createminrate = async(req, res)=>{
//     const apiauthkey = req.headers['apiauthkey'];

//     // Check if the API key is valid
//     if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
//         const messagetype = "error";
//         const message = "API route access error";
//         const filelocation = "createminrate.js";
//         logging(messagetype, message, filelocation);
//         return res.status(403).json({ message: "API route access forbidden" });
//     }
//     const {chargerid,chargingstationid,rate} = req.body;
//     try{
//         const existingrate = await prisma.dynamicRate.findFirst({
//             where:{
//              OR:[
//                 {
//                     chargerid:chargerid,
//                     chargingstationid:chargingstationid
//                 }
//              ]
//             }
//         })
//         if(existingrate){
//             const messagetype = "error";
//             const message = "Rate already exists";
//             const filelocation = "createminrate.js";
//             logging(messagetype, message, filelocation);
//             return res.status(400).json({ message: "Rate already exists" });
//         }
//         await prisma.dynamicRate.create({
//             data:{
//                 uid:generateCustomRandomUID(),
//                 chargerid:chargerid,
//                 chargingstationid:chargingstationid,
//                 rate:rate
//             }
//         })
//         const messagetype = "success";
//         const message = "Rate created successfully";
//         const filelocation = "createminrate.js";
//         logging(messagetype, message, filelocation);
//         return res.status(200).json({ message: "Rate created successfully" });

//     }catch(error){
//         const messagetype = "error";
//         const message = `${error}`;
//         const filelocation = "createminrate.js";
//         logging(messagetype, message, filelocation);
//         return res.status(500).json({ message: `${error}` });
//     }

// }

// export default Createminrate