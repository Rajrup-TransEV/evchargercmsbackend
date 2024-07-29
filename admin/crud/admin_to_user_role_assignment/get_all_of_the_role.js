// get all of the roles assigned to all of the users
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const get_all_roles = async(req,res)=>{
  const apiauthkey = req.headers['apiauthkey'];
  // Check if the API key is valid
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    return res.status(403).json({ message: "API route access forbidden" });
}
  try {
    const allroles = await prisma.assignRoles.findMany()
    if(!allroles){
        return res.status(404).json("no data found in database please assign one first")
    }
    return res.status(200).json({data:allroles})
  } catch (error) {
    console.log(error)
    return res.status(500).json({message:`error occurred :: ${error}`})
  }
   

} 

export default get_all_roles