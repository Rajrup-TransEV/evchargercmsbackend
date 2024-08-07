//stage logging
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const logging = async(messagetype,message,filelocation)=>{
    
    try {
        const createmessage =  await prisma.logRetention.create({
            data:{
                uid:crypto.randomUUID(),
                messagetype:messagetype,
                messages:message,
                filelocation:filelocation
            }
        })
        if(!createmessage){
            console.log("error occurred")
        }
        console.log("Message created",createmessage)
    } catch (error) {
        console.log(error)
    }
}

export default logging
