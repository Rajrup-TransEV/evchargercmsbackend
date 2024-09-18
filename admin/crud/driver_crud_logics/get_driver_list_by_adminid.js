// get driver by admin ID
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import { getCache, setCache } from "../../../utils/cacheops.js";

const prisma = new PrismaClient();

const getdriverbyadminid = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "get_driver_list_by_adminid.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { adminid } = req.body;

    try {
        // Check cache for existing data
        // const cacheddata = await getCache("getdlba");
        // if (cacheddata) {
        //     const messagetype = "success";
        //     const message = "All of the data retrieved from cache";
        //     const filelocation = "get_driver_list_by_adminid.js";
        //     logging(messagetype, message, filelocation);
        //     return res.status(200).json({ message: message, data: cacheddata });
        // }

        // Fetch driver data from the database
        const getdriverdata = await prisma.assigntovehicleowener.findMany({
            where: {
                adminid: adminid
            },
            select: {
                id: true,
                uid: true,
                vehicleowenerfirstname: true,
                vehicleowenerlastename: true,
                vehicleoweneremail: true,
                phonenumber: true,
                vehicleowenerlicense: true,
                vehicleowenergovdocs: true,
                vehicleowenernationality: true,
                vehicleoweneraddress: true,
                vehicleowenerrole: true,
                vehicles: {
                    select: {
                        id: true,
                        uid: true,
                        vehiclename: true,
                        vehiclemodel: true,
                        vehiclelicense: true,
                        vehiclecategory: true,
                        vehicletype: true,
                        vehicleowenerId: true,
                        isvehicleassigned: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                }
            }
        });

        // Fuse driver data with vehicle data
        const fusedData = getdriverdata.map(driver => ({
            ...driver,
            vehicles: driver.vehicles.map(vehicle => ({
                ...vehicle,
                ownerFirstName: driver.vehicleowenerfirstname, // Add owner's first name
                ownerLastName: driver.vehicleowenerlastename   // Add owner's last name
            }))
        }));

        const messagetype = "success";
        const message = `All of the data`;
        const filelocation = "get_driver_list_by_adminid.js";
        logging(messagetype, message, filelocation);

        // Cache the fused data for future requests
        // await setCache("getdlba", fusedData, 3600);
        
        return res.status(200).json({ message: "All of the data", data: fusedData });
    } catch (error) {
        console.log(error);
        const messagetype = "error";
        const message = `${error}`;
        const filelocation = "get_driver_list_by_adminid.js";
        logging(messagetype, message, filelocation);
        
        return res.status(500).json({ error: error });
    }
}

export default getdriverbyadminid;
