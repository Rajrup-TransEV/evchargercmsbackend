//delete a role for a user
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const delete_a_role =  async (req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      return res.status(403).json({ message: "API route access forbidden" });
  }
    try {
        const {get_role_id} = req.body;
        if(!get_role_id){
            return res.status(400).json({message:"please enter the role id"})
        }
    const delete_role = await prisma.assignRoles.delete({
        where:{
            uid:get_role_id
        }
    })
    if(!delete_role){
        return res.status(404).json({message:"Role not found or deleted from the database"})
    }
    return res.status(200).json({message:"Role data associated hasbeen deleted successfully"})
    } catch (error) {
    console.log(error)    
    return res.status(500).json({message:error})
    }
}

export default delete_a_role