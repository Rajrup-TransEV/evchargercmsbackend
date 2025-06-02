// verifyPayment.mjs
import { PrismaClient } from '@prisma/client';
import generateCustomRandomUID from '../../../lib/customuids.js';
import logging from '../../../logging/logging_generate.js';

const prisma = new PrismaClient();

const verifyPayment = async (req, res) => {
  const apiauthkey = req.headers['apiauthkey'];

  // Check if the API key is valid
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    const messagetype = "error";
    const message = "API route access error";
    const filelocation = "verifypayment.js";
    logging(messagetype, message, filelocation);
    return res.status(403).json({ message: "API route access forbidden" });
  }

  const {
    razorpay_payment_id,
    userid,
    walletid,
    chargeruid,
    price,
  } = req.body;

  if (razorpay_payment_id) {
    try {
      const walletfind = await prisma.wallet.findFirst({
        where: {
          uid: walletid,
        },
      });

      // Check if the wallet exists
      if (!walletfind) {
        const messagetype = "error";
        const message = "Error: No wallet data found";
        const filelocation = "init_wallet_recharge.js";
        logging(messagetype, message, filelocation);
        return res.status(404).json({ message: "Error: No wallet data found" });
      }

      // Check if the user exists in userProfile
      const findAppUserProfile = await prisma.user.findFirst({
        where: { uid: userid },
        select: { uid: true, username: true, email: true },
      });

      const findAdminUserProfile = await prisma.userProfile.findFirst({
        where: { uid: userid },
        select: {
          uid: true,
          firstname: true,
          email: true,
          address: true,
        },
      });

      if (findAppUserProfile || findAdminUserProfile) {
        // Calculate the new balance
        // createPayment(findAdminUserProfile?.firstname, findAdminUserProfile?.email, findAdminUserProfile?.address, price);

        const newBalance = parseFloat(walletfind.balance) + parseFloat(price);

        // Update the wallet balance
        await prisma.wallet.update({
          where: {
            uid: walletid,
          },
          data: {
            balance: newBalance.toString(), // Update the wallet balance
            iswalletrechargedone: true,
            recharger_made_by_which_user: userid,
          },
        });

        // Create a new record in the wallet recharge history table
        await prisma.walletreachargehistory.create({
          data: {
            uid: generateCustomRandomUID(),
            userassociatedid: userid,
            previousbalance: walletfind.balance.toString(), // Store the previous balance
            balanceleft: newBalance.toString(), // Store the new balance
            addedbalance: price.toString(), // Store the added balance
            numberofrecharge: "1", // This can be incremented based on your logic
          },
        });

        // Create a transaction record
        const trans = await prisma.transactionsdetails.create({
          data: {
            uid: generateCustomRandomUID(),
            paymentid: razorpay_payment_id,
            userid: userid,
            price: price,
            chargeruid: chargeruid,
            walletid: walletid,
          },
        });

        const messagetype = "success";
        const message = `${JSON.stringify(trans)}`;
        const filelocation = "verifypayment.js";
        logging(messagetype, message, filelocation);

        return res.status(201).json({
          message: "Wallet recharge done",
          actualprice: price,
          transactionDetails: trans,
        });
      } else {
        const messagetype = "error";
        const message = "No data found";
        const filelocation = "init_wallet_recharge.js";
        logging(messagetype, message, filelocation);
        
        return res.status(404).json({
          message: "No data found",
        });
      }
    } catch (error) {
      console.error(error);
      
      const messagetype = "error";
      const message = `${error.message || error}`;
      const filelocation = "verifypayment.js";
      logging(messagetype, message, filelocation);

      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(400).json({ message: "Missing payment ID" });
  }
};

export default verifyPayment;
