//main role create || list of role create
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const createlistofroles = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
  // Check if the API key is valid
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    return res.status(403).json({ message: "API route access forbidden" });
}
    try {
        const {rolename,roledesc}=req.body;
        const createroles  = await prisma.assignRoles.create({
            data:{
                uid:crypto.randomUUID(),
                rolename:rolename,
                roledesc:roledesc
            }
        })
        if(!createroles){
            return res.status(400).json("Something went wrong while creating the role please try again soon")
        }
        return res.status(200).json("role hasbeen created successfully")
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
  
}
export default createlistofroles