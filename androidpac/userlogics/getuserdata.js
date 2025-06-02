//get all of the data of nominal users
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const allnormaluserdata = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "getuserdata.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
try {
    const normaluserdata = await prisma.user.findMany()
        if(!normaluserdata){
            const messagetype = "error"
            const message = "error there is no data to show"
            const filelocation = "getuserdata.js"
            logging(messagetype,message,filelocation)
            return  res.status(404).json({message:"error there is no data to show"})
        }
        const messagetype = "success"
        const message ="All of the availabe data is"
        const filelocation = "getuserdata.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json({message:"All of the availabe data is" , data:normaluserdata})
} catch (error) {
    console.log(`error ${error}`)
    const messagetype = "error"
    const message =`Internal server error -  ${error}`
    const filelocation = "getuserdata.js"
    logging(messagetype,message,filelocation)
    return res.status(500).json({message:`Internal server error -  ${error}`})
}
}
export default allnormaluserdata