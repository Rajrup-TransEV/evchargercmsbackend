import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import createPayment from "../razor_pay_crud/razorpay_generate.js";
import generateCustomRandomUID from "../../../lib/customuids.js";

const prisma = new PrismaClient();

const rechargewallet = async (req, res) => {
  const apiauthkey = req.headers['apiauthkey'];

  // Check if the API key is valid
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    const messagetype = "error";
    const message = "API route access error";
    const filelocation = "init_wallet_recharge.js";
    logging(messagetype, message, filelocation);
    return res.status(403).json({ message: "API route access forbidden" });
  }

  const { userid, walletid, price } = req.body;
  console.log(userid)
  console.log(walletid)
  console.log(price)

  // Null exception handling
  if (!userid || !walletid || !price) {
    const messagetype = "error";
    const message = "Fields cannot be empty";
    const filelocation = "init_wallet_recharge.js";
    logging(messagetype, message, filelocation);
    return res.status(400).json({ message: "Fields cannot be empty" });
  }

  // Validate the recharge amount
  if (price <= 0) { // Ensure price is positive
    const messagetype = "error";
    const message = "Price must be greater than zero";
    const filelocation = "init_wallet_recharge.js";
    logging(messagetype, message, filelocation);
    return res.status(400).json({ message: "Price must be greater than zero" });
  }

  try {
    // Find the wallet by ID
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
      select: { uid: true, firstname: true, email: true, address: true },
    });

    if (findAppUserProfile || findAdminUserProfile) {
      // Prepare payment details
      // const paymentDetails = {
      //   firstname: findAdminUserProfile?.firstname || '',
      //   email: findAdminUserProfile?.email || findAppUserProfile?.email || '',
      //   address: findAdminUserProfile?.address || '',
      //   username: findAppUserProfile?.username || '',
      //   price,
      // };

      // Call createPayment with payment details
    createPayment(findAdminUserProfile.firstname,findAdminUserProfile.email,findAdminUserProfile.address,price)

      // Return the response indicating success
      const messagetype = "success";
      const message = "Wallet recharge done";
      const filelocation = "init_wallet_recharge.js";
      logging(messagetype, message, filelocation);

      return res.status(201).json({
        message,
        actualprice: price,
      });
    } else {
      const messagetype = "error";
      const message = "No user data found for the given ID.";
      const filelocation = "init_wallet_recharge.js";
      logging(messagetype, message, filelocation);
      
      return res.status(404).json({
        message,
      });
    }
  } catch (error) {
    console.error(error); // Log error to console for debugging
    const messagetype = "error";
    const message = `An error occurred while recharging the wallet - ${error.message}`;
    const filelocation = "init_wallet_recharge.js";
    
    logging(messagetype, message, filelocation);
    
    return res.status(500).json({
      message,
      error: error.message,
    });
  }
};

export default rechargewallet;
