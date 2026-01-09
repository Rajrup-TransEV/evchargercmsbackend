// //vehicler adminjs
// import { PrismaClient } from "@prisma/client";
// import logging from "../../../logging/logging_generate.js";
// import generateCustomRandomUID from "../../../lib/customuids.js";

// const prisma = new PrismaClient();

// const vehicledetailsbyadminid = async(req,res)=>{
//     const apiauthkey = req.headers['apiauthkey'];

//     // Check if the API key is valid
//     if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
//         const messagetype = "error";
//         const message = "API route access error";
//         const filelocation = "vehicledbyadmin.js";
//         logging(messagetype, message, filelocation);
//         return res.status(403).json({ message: "API route access forbidden" });
//     }

//     const {adminid} = req.body

//     try {
//         const userprofiledetails = await prisma.userProfile.findFirst({
//             where:{
//                 uid:adminid
//             },select:{
//                 firstname:true,
//                 lastname:true,
//                 email:true,
//                 phonenumber:true
//             }
//         })
//         const vehicledetails = await prisma.assigntovechicles.findMany({
//             where:{
                
//                 adminuid:adminid
//             }
//         })
//         const messagetype = "success";
//         const message = "Detailshabeenfetched";
//         const filelocation = "vehicledbyadmin.js";
//         logging(messagetype, message, filelocation);
//         return res.status(200).json({message:"your details",user:userprofiledetails,vehicle:vehicledetails})
//     } catch (error) {
//         console.log()
//         const messagetype = "error";
//         const message = `${error}`;
//         const filelocation = "vehicledbyadmin.js";
//         logging(messagetype, message, filelocation);
//         return res.status(500).json({message:"all the details",error:error})
//     }
// }

// export default vehicledetailsbyadminid

// vehicledbyadmin.js
import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const vehicledetailsbyadminid = async (req, res) => {
  const apiauthkey = req.headers["apiauthkey"];

  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    logging("error", "API route access error", "vehicledbyadmin.js");
    return res.status(403).json({ message: "API route access forbidden" });
  }

  const { adminid } = req.body;

  try {
    // (Optional / confusing) admin details — you said not required, so you can delete this later safely.
    const userprofiledetails = await prisma.userProfile.findFirst({
      where: { uid: adminid },
      select: {
        firstname: true,
        lastname: true,
        email: true,
        phonenumber: true,
      },
    });

    // 1) Fetch vehicles under this admin
    const vehicledetails = await prisma.assigntovechicles.findMany({
      where: { adminuid: adminid },
    });

    // 2) Collect unique owner emails (vehicleowner field)
    const ownerEmails = [
      ...new Set(
        vehicledetails
          .map((v) => (v.vehicleowner || "").trim().toLowerCase())
          .filter((e) => e.length > 0)
      ),
    ];

    console.log("ownerEmails:", ownerEmails);
    const debugUser = await prisma.user.findFirst({
    where: { email: "c.202ghosh@outlook.com" },
    select: { uid: true, email: true }
    });
    console.log("debugUser:", debugUser);

    // 3) Fetch all matching users in ONE query
    const ownerUsers = ownerEmails.length
      ? await prisma.user.findMany({
          where: { email: { in: ownerEmails } },
          select: {
            uid: true,
            username: true,
            email: true,
            phonenumber: true // adjust if your User field name differs
          },
        })
      : [];

    // 4) Build lookup map: email -> user
    const ownerUserByEmail = new Map(
      ownerUsers.map((u) => [u.email.trim().toLowerCase(), u])
    );

    // 5) Attach owner user to each vehicle (null if not found)
    // const vehiclesWithOwner = vehicledetails.map((v) => {
    //   const key = (v.vehicleowner || "").trim().toLowerCase();
    //   return {
    //     ...v,
    //     ownerUser: key ? ownerUserByEmail.get(key) || null : null,
    //   };
    // });

    const vehiclesWithOwner = vehicledetails.map((v) => {
      const key = (v.vehicleowner || "").trim().toLowerCase();
      const owner = key ? ownerUserByEmail.get(key) || null : null;

      return {
        // keep only the fields you want from vehicle
        id: v.id,
        uid: v.uid,
        vehiclename: v.vehiclename,
        vehiclemodel: v.vehiclemodel,
        vehiclelicense: v.vehiclelicense,
        vehiclevin: v.vehiclevin,
        vehiclebatterycapacity: v.vehiclebatterycapacity,
        vehiclerange: v.vehiclerange,
        vehicleowner: v.vehicleowner,
        vehiclecategory: v.vehiclecategory,
        vehicletype: v.vehicletype,
        adminuid: v.adminuid,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,

        // ownerUser with uid renamed to userid
        ownerUser: owner
          ? {
              userid: owner.uid,
              username: owner.username,
              email: owner.email,
              phonenumber: owner.phonenumber,
            }
          : null,
      };
    });

    logging("success", "Detailshabeenfetched", "vehicledbyadmin.js");

    return res.status(200).json({
      message: "your details",
      vehicle: vehiclesWithOwner,
    });
  } catch (error) {
    logging("error", String(error?.message || error), "vehicledbyadmin.js");
    return res.status(500).json({ message: "error", error: String(error) });
  }
};

export default vehicledetailsbyadminid;
