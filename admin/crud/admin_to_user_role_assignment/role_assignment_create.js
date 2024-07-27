import { PrismaClient } from "@prisma/client";
import crypto from "crypto"; // Ensure to import crypto if not already imported

const prisma = new PrismaClient();

const associateRoleToUser = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        return res.status(403).json({ message: "API route access forbidden" });
    }

    try {
        const { userid, roleid } = req.body;

        // Validate input
        if (!userid || !roleid) {
            return res.status(400).json("User ID and Role ID are required to assign the role.");
        }

        // Fetch role details based on roleid
        const role = await prisma.assignRoles.findUnique({
            where: { uid: roleid },
            select: { rolename: true, roledesc: true } // Assuming the role has 'name' and 'description' fields
        });

        if (!role) {
            return res.status(404).json("Role not found.");
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
            return res.status(200).json("Role for the user has been updated successfully.");
        } else {
            // Create a new role assignment
            await prisma.assignRoles.create({
                data: {
                    userid: userid,
                    rolename: rolename,
                    roledesc: roledesc
                }
            });
            return res.status(201).json("Role for the user has been created successfully.");
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: `An error occurred while processing the request: ${error.message}` });
    }
};

export default associateRoleToUser;