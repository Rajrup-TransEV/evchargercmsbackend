//update a userole and details

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const update_user_role_details = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      return res.status(403).json({ message: "API route access forbidden" });
  }
    try {
        const { userid,uid, rolename, roledesc } = req.body;

        // Create an object to hold the updated data
        const updateData = {};

        // Only add fields that are provided in the request body
        if (rolename) updateData.rolename = rolename;
        if (roledesc) updateData.roledesc = roledesc;

        // Ensure that at least one field is provided for the update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No fields provided for update' });
        }

        // Update the user role assignment
        const updatedRole = await prisma.assignRoles.update({
            where: {
                OR: [
                    { uid: uid },
                    { userid: userid }
                ],
            },
            data: updateData // Use the object with only the updated fields
        });

        // Return the updated role details
        return res.status(200).json({message : updatedRole});
    } catch (error) {
        console.error('Error updating user role details:', error);
        return res.status(500).json({ error: 'An error occurred while updating user role details' });
    }
};

export default update_user_role_details;