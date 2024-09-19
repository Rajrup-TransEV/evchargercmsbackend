// verifyPayment.mjs
import { PrismaClient } from '@prisma/client';

import generateCustomRandomUID from '../../../lib/customuids.js';
import logging from '../../../logging/logging_generate.js';

const prisma = new PrismaClient();

const verifyPayment = async (req, res) => {
  
  const apiauthkey = req.headers['apiauthkey'];
  // Check if the API key is valid
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    const messagetype = "error"
    const message = "API route access error"
    const filelocation = "verifypayment.js"
    logging(messagetype,message,filelocation)
    return res.status(403).json({ message: "API route access forbidden" });
}
  const { razorpay_payment_id,  userid,
    walletid,
    chargeruid,
    price, } = req.body;
    try {
      const trans = await prisma.transactionsdetails.create({
        data:{
          uid:generateCustomRandomUID(),
          paymentid:razorpay_payment_id,
          userid:userid,
          price:price,
          chargeruid:chargeruid,
          walletid:walletid
        }
  
      })
      const messagetype = "success"
      const message = `${JSON.stringify(trans)}`
      const filelocation = "verifypayment.js"
      logging(messagetype,message,filelocation)
      return 200;
    } catch (error) {
      console.log(error)
      const messagetype = "error"
      const message = `${error}`
      const filelocation = "verifypayment.js"
      logging(messagetype,message,filelocation)
    }
   
};

export default verifyPayment;
