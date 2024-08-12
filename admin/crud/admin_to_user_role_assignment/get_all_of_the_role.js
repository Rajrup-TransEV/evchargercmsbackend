// get all of the roles assigned to all of the users
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
const prisma = new PrismaClient();

const get_all_roles = async(req,res)=>{
  const apiauthkey = req.headers['apiauthkey'];
  // Check if the API key is valid
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    const messagetype = "error";
    const message = "API route access error";
    const filelocation = "get_all_of_the_role.js";
    logging(messagetype, message, filelocation);
    return res.status(403).json({ message: "API route access forbidden" });
}
  try {
    const allroles = await prisma.assignRoles.findMany()
    if(!allroles){
      const messagetype = "error";
      const message = "no data found in database please assign one first";
      const filelocation = "get_all_of_the_role.js";
      logging(messagetype, message, filelocation);
        return res.status(404).json({message:"no data found in database please assign one first"})
    }
    const messagetype = "success";
    const message = "Get all of the data hasbeen added";
    const filelocation = "get_all_of_the_role.js";
    logging(messagetype, message, filelocation);
    return res.status(200).json({message:"all of the listed roles",data:allroles})
  } catch (error) {
    console.log(error)
    const messagetype = "error";
    const message = `error occurred :: ${error}`;
    const filelocation = "get_all_of_the_role.js";
    logging(messagetype, message, filelocation);
    return res.status(500).json({message:`error occurred :: ${error}`})
  }
   

} 

export default get_all_roles