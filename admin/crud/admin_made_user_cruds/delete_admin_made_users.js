//delete data of the users who hasbeen previously created by super admin 
//also delete all of the user bind with users
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const delete_user_profile = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { uid } = req.body; // Assuming the UID is passed in the request body

    try {
        // Validate that the UID is provided
        if (!uid) {
            return res.status(400).json({ error: 'please provide the user id that you want to delete' });
        }

        // Delete the charger units associated with the user
        await prisma.charger_Unit.deleteMany({
            where: {
                userId: uid
            }
        });

        // Delete the user profile
        const deleteduser = await prisma.userProfile.delete({
            where: {
                uid
            }
        });

        if (!deleteduser) {
            return res.status(404).json({ message: "User data not found or already deleted from the database" });
        }

        // Return a success message
        return res.status(200).json({ message: 'User associated with all of the chargers has been deleted' });
    } catch (error) {
        console.error('Error deleting user profile:', error);
        return res.status(500).json({ message: `An error occurred while deleting the user data :: ${error}` });
    }
};

export default delete_user_profile;