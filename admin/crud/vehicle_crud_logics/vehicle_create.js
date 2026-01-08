import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../lib/customuids.js";

const prisma = new PrismaClient();
const ASSOCIATED_ADMINID=process.env.ASSOCIATED_ADMIN

const vehilcle_create = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "vehicle_create.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { vehiclename, vehiclemodel, vehiclelicense, vehicleowner, vehicletype, vehiclecategory,adminuid,vehiclevin,
  vehiclerange,
  vehiclebatterycapacity } = req.body;

    try {
        // Validate required fields
        if (!vehiclename || !vehiclemodel || !vehiclelicense || !vehicleowner || !vehicletype || !vehiclecategory) {
            const messagetype = "error";
            const message = "No value provided for required fields";
            const filelocation = "vehicle_create.js";
            logging(messagetype, message, filelocation);
            return res.status(400).json({ message: "No value provided for required fields" });
        }

        // Check if the owner exists in Assigntovehicleowener model
        let ownerRecord;
        
        ownerRecord = await prisma.userProfile.findUnique({
            where: { email: vehicleowner },
            select: { uid: true }
        });

        if (ownerRecord) {
            // Create the vehicle record using Assigntovehicleowener UID
            const vehicledatacreate = await prisma.assigntovechicles.create({
                data: {
                    uid: generateCustomRandomUID(),
                    vehiclename,
                    vehiclemodel,
                    vehiclelicense,
                    vehicletype,
                    vehicleowner,
                    vehiclecategory,
                    adminuid:adminuid,
                    associatedadminid:ASSOCIATED_ADMINID,
                    vehiclevin,
                    vehiclerange,
                    vehiclebatterycapacity,
                }
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
            
            return res.status(200).json({ message: "Vehicle data has successfully saved" });
        } else {
            // If not found in Assigntovehicleowener, check in User model
            ownerRecord = await prisma.user.findUnique({
                where: { email: vehicleowner },
                select: { uid: true } // Assuming user table has a uid field
            });

            if (!ownerRecord) {
                return res.status(404).json({ message: 'No user associated with this email' });
            }

            // Create the vehicle record using User UID
            const vehicledatacreate = await prisma.assigntovechicles.create({
                data: {
                    uid: generateCustomRandomUID(),
                    vehiclename,
                    vehiclemodel,
                    vehiclelicense,
                    vehicletype,
                    vehicleowner,
                    vehiclecategory,
                    adminuid:adminuid,
                    userId: ownerRecord.uid, // Use userId for normal users
                    vehiclevin,
                    vehiclerange,
                    vehiclebatterycapacity,
                }
            });

            if (!vehicledatacreate) {
                const messagetype = "error";
                const message = "There is something wrong while creating the vehicle";
                const filelocation = "vehicle_create.js";
                logging(messagetype, message, filelocation);
                return res.status(503).json({ message: "There is something wrong" });
            }

            const messagetype = "success";
            const message = "Vehicle data has successfully saved for normal user";
            const filelocation = "vehicle_create.js";
            logging(messagetype, message, filelocation);
            
            return res.status(200).json({ message: "Vehicle data has successfully saved for normal user" });
        }

    } catch (error) {
        console.error(error);
        const messagetype = "error";
        const message = `${error.message || 'Internal Server Error'}`;
        const filelocation = "vehicle_create.js";
        logging(messagetype, message, filelocation);
        
        return res.status(500).json({ message });
    }
}

export default vehilcle_create;