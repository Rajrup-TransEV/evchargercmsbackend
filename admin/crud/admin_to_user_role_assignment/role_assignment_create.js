import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();
const ASSOCIATED_ADMINID=process.env.ASSOCIATED_ADMIN
const associateRoleToUser = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "role_assignment_create.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }

    try {
        const { userid, roleid } = req.body;
       
        // Validate input
        if (userid==="" || roleid==="") {
            const messagetype = "error";
            const message = "User ID and Role ID are required to assign the role.";
            const filelocation = "role_assignment_create.js";
            logging(messagetype, message, filelocation);
            return res.status(400).json({message:"User ID and Role ID are required to assign the role."});
        }

        // Fetch role details based on roleid
        const role = await prisma.assignRoles.findUnique({
            where: { uid: roleid },
            select: { rolename: true, roledesc: true } // Assuming the role has 'name' and 'description' fields
        });

        if (!role) {
            const messagetype = "error";
            const message = "Role not found.";
            const filelocation = "role_assignment_create.js";
            logging(messagetype, message, filelocation);
            return res.status(404).json({message:"Role not found."});
        }

        const { rolename: rolename, roledesc: roledesc } = role;

        // Check if the role assignment already exists
        const existingAssignment = await prisma.assignRoles.findUnique({
            where: { uid: roleid }
        });

        if (existingAssignment) {
            // Update the existing role assignment
            await prisma.assignRoles.update({
                where: { uid: roleid },
                data: {
                  userid:userid,
                    rolename: rolename,
                    roledesc: roledesc,
                    updatedAt: new Date() // Update timestamp
                }
            });
            const messagetype = "update";
            const message = "Role for the user has been updated successfully.";
            const filelocation = "role_assignment_create.js";
            logging(messagetype, message, filelocation);
            return res.status(200).json({message:"Role for the user has been updated successfully."});
        } else {
            // Create a new role assignment
            await prisma.assignRoles.create({
                data: {
                    userid: userid,
                    rolename: rolename,
                    roledesc: roledesc,
                    associatedadminid:ASSOCIATED_ADMINID
                }
            });
            const messagetype = "success";
            const message = "Role for the user has been created successfully.";
            const filelocation = "role_assignment_create.js";
            logging(messagetype, message, filelocation);
            return res.status(201).json({message:"Role for the user has been created successfully."});
        }
    } catch (error) {
        console.error(error);
        const messagetype = "success";
        const message = `An error occurred while processing the request : ${error}`;
        const filelocation = "role_assignment_create.js";
        logging(messagetype, message, filelocation);
        return res.status(500).json({ message: `An error occurred while processing the request: ${error.message}` });
    }
};

export default associateRoleToUser;