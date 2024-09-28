// create favorites
import { PrismaClient } from "@prisma/client";
import generateCustomRandomUID from "../../../../lib/customuids";

const prisma = new PrismaClient();
const favoritechargers = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "createfavorites.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
const {chargeruid,useruid,isfavorite}=req.body
try {
    const createdetails = await prisma.favorites.create({
        data:{
            uid:generateCustomRandomUID(),
            chargeruid:chargeruid,
            useruid:useruid,
            isfavorite:isfavorite
        }
    })
    const messagetype = "success"
    const message = "Data hasbeen created successfully"
    const filelocation = "createfavorites.js"
    logging(messagetype,message,filelocation)
    return res.status(200).json({message:"Charger added to favorites",createdetails})
} catch (error) {
    const messagetype = "error"
    const message = `${error}`
    const filelocation = "createfavorites.js"
    logging(messagetype,message,filelocation)
    console.log(error)
    return res.status(500).json({error:error})
}

}

export default favoritechargers