import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const user_who_bought_the_charger_details = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "user_who_bought_which_charger.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { get_charger_id, get_user_id } = req.body;

    try {
        // Validate input
        if (!get_charger_id==="" || !get_user_id==="") {
            const messagetype = "error";
            const message = "Charger ID and User ID are required";
            const filelocation = "user_who_bought_which_charger.js";
            logging(messagetype, message, filelocation);
            return res.status(400).json({ message: "Charger ID and User ID are required" });
        }

        // Fetch charger details
        const get_charger_details = await prisma.charger_Unit.findMany({
            where: {
                uid: get_charger_id,
                userId: get_user_id
            },
            select: {
                uid: true,
                Chargerserialnum: true,
                ChargerName: true,
                Chargerhost: true,
                Segment: true,
                Subsegment: true,
                Total_Capacity: true,
                Chargertype: true,
                parking: true,
                number_of_connectors: true,
                Connector_type: true,
                connector_total_capacity: true,
                lattitude: true,
                longitute: true,
                full_address: true,
                charger_use_type: true,
                twenty_four_seven_open_status: true,
                userId: true,
                createdAt: true,
            }
        });

        // Check if charger details were found
        if (get_charger_details.length === 0) {
            const messagetype = "error";
            const message = "User has not bought any charger";
            const filelocation = "user_who_bought_which_charger.js";
            logging(messagetype, message, filelocation);
            return res.status(404).json({ message: "User has not bought any charger" });
        }

        // Fetch associated user details
        const associate_user = await prisma.userProfile.findFirstOrThrow({
            where: {
                uid: get_user_id
            },
            select: {
                uid: true,
                firstname: true,
                lastname: true,
                email: true,
                address: true,
                phonenumber: true,
                role: true,
                designation: true,
                createdAt: true,
                updatedAt: true 
            }
        });

        // Combine charger details with user firstname
        const charger_details = get_charger_details.map((charger) => ({
            ...charger,
            firstname: associate_user.firstname,
            phonenumber:associate_user.phonenumber
        }));

        const messagetype = "success";
        const message = "Charger associated with the user has been fetched successfully";
        const filelocation = "user_who_bought_which_charger.js";
        logging(messagetype, message, filelocation);

        return res.status(200).json({ userdetails: associate_user, user_chargerunit_details: charger_details });
    } catch (error) {
        console.log(error);
        const messagetype = "error";
        const message = `Something went wrong - ${error.message}`;
        const filelocation = "user_who_bought_which_charger.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({ message: "Something went wrong", data: error.message });
    }
};

export default user_who_bought_the_charger_details;
