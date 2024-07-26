//charger fetch data fileter by user id
//means which user bought which charger or list of charges


import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const user_who_bought_the_charger_details =  async(req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      return res.status(403).json({ message: "API route access forbidden" });
  }
    const get_user_id_from_params  =  req.body;
    const get_charger_details  = await prisma.charger_Unit.findMany(
        {
            where:{
                userId:get_user_id_from_params
            }
        }
    )
    if(!get_charger_details){
        return res.status(404).json("user has not bought any charger still now")
    }
    const associate_user  = await prisma.userProfile.findFirstOrThrow({
        where:{
            uid:get_user_id_from_params
        }
    })
    if(!associate_user){
        return res.status(404).json("no user hasbeen found with the given user id")
    }
    return res.status(200).json({userdetails:associate_user,user_chargerunit_details:get_charger_details})
}

export default user_who_bought_the_charger_details;