//role assign to user create
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const createrole = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      return res.status(403).json({ message: "API route access forbidden" });
  }
try {
  const {userid,rolename,  roledesc} = req.body
  if (!userid){
    return res.status(400).json("user id is required to assign the role")
  }

  const process =  await prisma.assignRoles.create({
        data:{
            uid:crypto.randomUUID(),
            userid:userid,
            rolename:rolename,
            roledesc:roledesc
        }
})

if (!process){
    return res.status(503).json("Cannot create the role due to some issue at backend")
}
return res.status(200).json("role for the perticualr habeen created successfully")
} catch (error) {
 console.log(error)   
 return res.status(500).json({message:`message processing error occurred ${error}`})    
}
}

export default createrole
