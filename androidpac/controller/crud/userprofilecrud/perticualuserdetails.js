import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const pprofiledetails = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error";
        const message = "API route access error";
        const filelocation = "androidpac/perticularuserdetails.js";
        logging(messagetype, message, filelocation);
        return res.status(403).json({ message: "API route access forbidden" });
    }
    
    const { userid } = req.body;
    
    try {
        const find = await prisma.user.findFirstOrThrow({
            where: {
                uid: userid
            },
            select: {
                id: true,
                uid: true,
                email: true,
                username: true,
                phonenumber: true,
                profilepicture: true,
                createdAt: true,
                updatedAt: true
            }
        });

        let profileimagedataurl = null;

        // Check if profile picture exists
        if (find.profilepicture) {
            const chfilepath = path.resolve(find.profilepicture);
            const filebuffer = fs.readFileSync(chfilepath);
            const base64chImage = filebuffer.toString('base64');
            profileimagedataurl = `data:image/png;base64,${base64chImage}`;
        }

        const messagetype = "success";
        const message = "Profile details have been fetched successfully";
        const filelocation = "androidpac/perticularuserdetails.js";
        logging(messagetype, message, filelocation);

        return res.status(200).json({
            message: "Profile details have been fetched successfully",
            data: find,
            pfimage: profileimagedataurl
        });
        
    } catch (error) {
        console.log(error);
        const messagetype = "error";
        const message = `${error}`;
        const filelocation = "androidpac/perticularuserdetails.js";
        logging(messagetype, message, filelocation);
        
        return res.status(500).json({ message: "Error occurred", error: error });
    }
}

export default pprofiledetails;
