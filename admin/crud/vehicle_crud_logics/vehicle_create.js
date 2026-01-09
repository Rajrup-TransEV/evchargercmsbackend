// import { PrismaClient } from "@prisma/client";
// import logging from "../../../logging/logging_generate.js";
// import generateCustomRandomUID from "../../../lib/customuids.js";

// const prisma = new PrismaClient();
// const ASSOCIATED_ADMINID=process.env.ASSOCIATED_ADMIN

// const vehilcle_create = async (req, res) => {
//     const apiauthkey = req.headers['apiauthkey'];

//     // Check if the API key is valid
//     if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
//         const messagetype = "error";
//         const message = "API route access error";
//         const filelocation = "vehicle_create.js";
//         logging(messagetype, message, filelocation);
//         return res.status(403).json({ message: "API route access forbidden" });
//     }

//     const { vehiclename, vehiclemodel, vehiclelicense, vehicleowner, vehicletype, vehiclecategory,adminuid,vehiclevin,
//   vehiclerange,
//   vehiclebatterycapacity } = req.body;

//     try {
//         // Validate required fields
//         if (!vehiclename || !vehiclemodel || !vehiclelicense || !vehicleowner || !vehicletype || !vehiclecategory) {
//             const messagetype = "error";
//             const message = "No value provided for required fields";
//             const filelocation = "vehicle_create.js";
//             logging(messagetype, message, filelocation);
//             return res.status(400).json({ message: "No value provided for required fields" });
//         }

//         // Check if the owner exists in Assigntovehicleowener model
//         let ownerRecord;
        
//         ownerRecord = await prisma.userProfile.findUnique({
//             where: { email: vehicleowner },
//             select: { uid: true }
//         });

//         if (ownerRecord) {
//             // Create the vehicle record using Assigntovehicleowener UID
//             const vehicledatacreate = await prisma.assigntovechicles.create({
//                 data: {
//                     uid: generateCustomRandomUID(),
//                     vehiclename,
//                     vehiclemodel,
//                     vehiclelicense,
//                     vehicletype,
//                     vehicleowner,
//                     vehiclecategory,
//                     adminuid:adminuid,
//                     associatedadminid:ASSOCIATED_ADMINID,
//                     vehiclevin,
//                     vehiclerange,
//                     vehiclebatterycapacity,
//                 }
//             });

//             if (!vehicledatacreate) {
//                 const messagetype = "error";
//                 const message = "There is something wrong while creating the vehicle";
//                 const filelocation = "vehicle_create.js";
//                 logging(messagetype, message, filelocation);
//                 return res.status(503).json({ message: "There is something wrong" });
//             }

//             const messagetype = "success";
//             const message = "Vehicle data has successfully saved";
//             const filelocation = "vehicle_create.js";
//             logging(messagetype, message, filelocation);
            
//             return res.status(200).json({ message: "Vehicle data has successfully saved" });
//         } else {
//             // If not found in Assigntovehicleowener, check in User model
//             ownerRecord = await prisma.user.findUnique({
//                 where: { email: vehicleowner },
//                 select: { uid: true } // Assuming user table has a uid field
//             });

//             if (!ownerRecord) {
//                 return res.status(404).json({ message: 'No user associated with this email' });
//             }

//             // Create the vehicle record using User UID
//             const vehicledatacreate = await prisma.assigntovechicles.create({
//                 data: {
//                     uid: generateCustomRandomUID(),
//                     vehiclename,
//                     vehiclemodel,
//                     vehiclelicense,
//                     vehicletype,
//                     vehicleowner,
//                     vehiclecategory,
//                     adminuid:adminuid,
//                     userId: ownerRecord.uid, // Use userId for normal users
//                     vehiclevin,
//                     vehiclerange,
//                     vehiclebatterycapacity,
//                 }
//             });

//             if (!vehicledatacreate) {
//                 const messagetype = "error";
//                 const message = "There is something wrong while creating the vehicle";
//                 const filelocation = "vehicle_create.js";
//                 logging(messagetype, message, filelocation);
//                 return res.status(503).json({ message: "There is something wrong" });
//             }

//             const messagetype = "success";
//             const message = "Vehicle data has successfully saved for normal user";
//             const filelocation = "vehicle_create.js";
//             logging(messagetype, message, filelocation);
            
//             return res.status(200).json({ message: "Vehicle data has successfully saved for normal user" });
//         }

//     } catch (error) {
//         console.error(error);
//         const messagetype = "error";
//         const message = `${error.message || 'Internal Server Error'}`;
//         const filelocation = "vehicle_create.js";
//         logging(messagetype, message, filelocation);
        
//         return res.status(500).json({ message });
//     }
// }

// export default vehilcle_create;


import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../lib/customuids.js";
 
const prisma = new PrismaClient();
const ASSOCIATED_ADMINID = process.env.ASSOCIATED_ADMIN;
 
const vehicle_create = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
 
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "vehicle_create.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }
 
    const { 
        vehiclename, 
        vehiclemodel, 
        vehiclelicense, 
        vehicleowner, 
        vehicletype, 
        vehiclecategory,
        vehiclevin,
        vehiclerange,
        vehiclebatterycapacity 
    } = req.body;
 
    try {
        // Validate required fields
        if (!vehiclename || !vehiclemodel || !vehiclelicense || !vehicleowner || !vehicletype || !vehiclecategory) {
            const messagetype = "error";
            const message = "No value provided for required fields";
            const filelocation = "vehicle_create.js";
            logging(messagetype, message, filelocation);
            return res.status(400).json({ message: "No value provided for required fields" });
        }
 
        // Check if the owner exists in userProfile model by email
        let ownerRecord = await prisma.userProfile.findUnique({
            where: { email: vehicleowner },
            select: { uid: true }
        });
 
        let vehicleData;
 
        if (ownerRecord) {
            // Owner is in userProfile (likely an admin/assigned user)
            vehicleData = {
                uid: generateCustomRandomUID(),
                vehiclename,
                vehiclemodel,
                vehiclelicense,
                vehicletype,
                vehicleowner,
                vehiclecategory,
                vehiclevin: vehiclevin || null,
                vehiclerange: vehiclerange || null,
                vehiclebatterycapacity: vehiclebatterycapacity || null,
                associateadmin: {
                    connect: {
                        uid: ownerRecord.uid
                    }
                }
            };
        } else {
            // Check in regular User model
            ownerRecord = await prisma.user.findUnique({
                where: { email: vehicleowner },
                select: { uid: true }
            });
 
            if (!ownerRecord) {
                const messagetype = "error";
                const message = "No user associated with this email";
                const filelocation = "vehicle_create.js";
                logging(messagetype, message, filelocation);
                return res.status(404).json({ message: 'No user associated with this email' });
            }
 
            // Owner is a regular user
            vehicleData = {
                uid: generateCustomRandomUID(),
                vehiclename,
                vehiclemodel,
                vehiclelicense,
                vehicletype,
                vehicleowner,
                vehiclecategory,
                vehiclevin: vehiclevin || null,
                vehiclerange: vehiclerange || null,
                vehiclebatterycapacity: vehiclebatterycapacity || null,
                user: {
                    connect: {
                        uid: ownerRecord.uid
                    }
                }
            };
        }
 
        // If ASSOCIATED_ADMINID is provided, connect the vehicle to the admin
        if (ASSOCIATED_ADMINID) {
            const adminRecord = await prisma.userProfile.findUnique({
                where: { uid: ASSOCIATED_ADMINID }
            });
 
            if (adminRecord) {
                vehicleData.associateadmin = {
                    connect: {
                        uid: ASSOCIATED_ADMINID
                    }
                };
            }
        }
 
        // Create the vehicle record
        const vehicledatacreate = await prisma.assigntovechicles.create({
            data: vehicleData
        });
 
        if (!vehicledatacreate) {
            const messagetype = "error";
            const message = "There is something wrong while creating the vehicle";
            const filelocation = "vehicle_create.js";
            logging(messagetype, message, filelocation);
            return res.status(503).json({ message: "There is something wrong" });
        }
 
        const messagetype = "success";
        const message = "Vehicle data has successfully saved";
        const filelocation = "vehicle_create.js";
        logging(messagetype, message, filelocation);
        return res.status(200).json({ 
            message: "Vehicle data has successfully saved",
            vehicleId: vehicledatacreate.uid 
        });
 
    } catch (error) {
        console.error("Vehicle creation error:", error);
        const messagetype = "error";
        const message = error.message || 'Internal Server Error';
        const filelocation = "vehicle_create.js";
        logging(messagetype, message, filelocation);
        // Handle specific Prisma errors
        if (error.code === 'P2002') {
            return res.status(400).json({ 
                message: "A vehicle with this license or VIN already exists" 
            });
        }
        return res.status(500).json({ 
            message: "Failed to create vehicle. Please try again." 
        });
    }
}
 
export default vehicle_create;