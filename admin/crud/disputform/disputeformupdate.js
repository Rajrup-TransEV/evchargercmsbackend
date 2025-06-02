//disputeform update

import { PrismaClient } from "@prisma/client";
import emailQueue from "../../../lib/emailqueue.js";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const disputeformupdate = async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];

    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        const messagetype = "error"
        const message = "API route access error"
        const filelocation = "disputeformupdate.js"
        logging(messagetype,message,filelocation)
        return res.status(403).json({ message: "API route access forbidden" });
    }
    const {uid}=req.body;
    try {
        if(uid===""){
            const messagetype = "error"
            const message = "Disputeform's uid is required in order to update the data"
            const filelocation = "disputeformupdate.js"
            logging(messagetype,message,filelocation)
            return res.status(400).json({message:"Dispute form id is requied inorder to update it"})
        }       
        //find the disputeform by uid
        const disputeform  = await prisma.disputFrom.findFirstOrThrow({
            where:{
                id:uid
            }
        })
        const updatedata = {}
        const {
            customername,
            relatedtoev,
            reason,
            morethanonecharge,
            wrongcharged,
            didnotreceiverefund,
            paidforothermeans,
            disputtransaction,
            chargedregularly,
            notlistedabove,
            transactiondetails,
            disputedetails,
            associatedadminid
        }=req.body;
        if(customername){
            updatedata.customername = customername;
            const messagetype = "update"
            const message = `Customername: ${customername}`
            const filelocation = "disputeformupdate.js"
            logging(messagetype,message,filelocation)
        }
        if(relatedtoev){
            updatedata.relatedtoev=relatedtoev;
            const messagetype = "update"
            const message = `Related to ev: ${relatedtoev}`
            const filelocation = "disputeformupdate.js"
            logging(messagetype,message,filelocation)
        }
        if(reason){
            updatedata.reason=reason;
            const messagetype = "update"
            const message = `reason: ${reason}`
            const filelocation = "disputeformupdate.js"
            logging(messagetype,message,filelocation)
        }
        if(morethanonecharge){
            updatedata.morethanonecharge=morethanonecharge;
            const messagetype = "update"
            const message = `morethanonecharge: ${morethanonecharge}`
            const filelocation = "disputeformupdate.js"
            logging(messagetype,message,filelocation)
        }
        if(wrongcharged){
            updatedata.wrongcharged=wrongcharged;
            const messagetype = "update"
            const message = `wrongcharged: ${wrongcharged}`
            const filelocation = "disputeformupdate.js"
            logging(messagetype,message,filelocation)
        }
        if(didnotreceiverefund){
            updatedata.didnotreceiverefund=didnotreceiverefund;
            const messagetype = "update"
            const message = `didnotreceiverefund: ${didnotreceiverefund}`
            const filelocation = "disputeformupdate.js"
            logging(messagetype,message,filelocation)
        }
        if(paidforothermeans){
            updatedata.paidforothermeans=paidforothermeans;
            const messagetype = "update"
            const message = `paidforothermeans: ${paidforothermeans}`
            const filelocation = "disputeformupdate.js"
            logging(messagetype,message,filelocation)
        }
        if(disputtransaction){
            updatedata.disputtransaction=disputtransaction;
            const messagetype = "update"
            const message = `disputtransaction: ${disputtransaction}`
            const filelocation = "disputeformupdate.js"
            logging(messagetype,message,filelocation)
        }
        if(chargedregularly){
            updatedata.chargedregularly=chargedregularly;
            const messagetype = "update"
            const message = `chargedregularly: ${chargedregularly}`
            const filelocation = "disputeformupdate.js"
            logging(messagetype,message,filelocation)
        }
        if(notlistedabove){
            updatedata.notlistedabove=notlistedabove;
            const messagetype = "update"
            const message = `notlistedabove: ${notlistedabove}`
            const filelocation = "disputeformupdate.js"
            logging(messagetype,message,filelocation)
        }
        if(transactiondetails){
            updatedata.transactiondetails=transactiondetails;
            const messagetype = "update"
            const message = `transactiondetails: ${transactiondetails}`
            const filelocation = "disputeformupdate.js"
            logging(messagetype,message,filelocation)
        }
        if(disputedetails){
            updatedata.disputedetails=disputedetails;
            const messagetype = "update"
            const message = `disputedetails: ${disputedetails}`
            const filelocation = "disputeformupdate.js"
            logging(messagetype,message,filelocation)
        }
        if(associatedadminid){
            updatedata.associatedadminid=associatedadminid;
            const messagetype = "update"
            const message = `associatedadminid: ${associatedadminid}`
            const filelocation = "disputeformupdate.js"
            logging(messagetype,message,filelocation)
        }
        //update the data
        const updateform = await prisma.disputFrom.update({
            where:{id:uid},
            data:updatedata
        })
        const messagetype = "success"
        const message = 'dispute form update success'
        const filelocation = "disputeformupdate.js"
        logging(messagetype,message,filelocation)
        return res.status(200).json(updateform)
    } catch (error) {
        console.log(error)
        const messagetype = "error"
        const message = `error ${error}`
        const filelocation = "disputeformupdate.js"
        logging(messagetype,message,filelocation)
        return res.status(500).json({error:error})
    }
}
export default disputeformupdate