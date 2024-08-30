import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const rechargewallet = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      const messagetype = "error"
      const message = "API route access error"
      const filelocation = "init_wallet_recharge.js"
      logging(messagetype,message,filelocation)
      return res.status(403).json({ message: "API route access forbidden" });
  }
  const { userid, walletid, price } = req.body;
  //null exception handeling
  if(!userid||!walletid||!price){
    const messagetype = "error"
    const message = "Fields cannot be empty"
    const filelocation = "init_wallet_recharge.js"
    logging(messagetype,message,filelocation)
    return res.status(400).json({message:"Fields cannot be empty"})
  }
  // Validate the recharge amount
  if (price <= 100) {
    const messagetype = "error"
    const message = "Price cannot be less than 100 or negative"
    const filelocation = "init_wallet_recharge.js"
    logging(messagetype,message,filelocation)
    return res.status(400).json({ message: "Price cannot be less than 100 or negative" });
  }

  try {
    // Find the wallet by ID
    const walletfind = await prisma.wallet.findUnique({
      where: {
        uid: walletid,
      },
    });

    // Check if the wallet exists
    if (!walletfind) {
        const messagetype = "error"
        const message = "Error: No wallet data found"
        const filelocation = "init_wallet_recharge.js"
        logging(messagetype,message,filelocation)
      return res.status(404).json({ message: "Error: No wallet data found" });
    }

    // Check if the user exists in userProfile
    const findAppUserProfile = await prisma.user.findUnique({
      where: { uid: userid },
      select: { uid: true },
    });

    const findAdminUserProfile = await prisma.userProfile.findUnique({
      where: { uid: userid },
      select: { uid: true },
    });

    if (findAppUserProfile || findAdminUserProfile) {
      // Calculate the new balance
      const newBalance = parseFloat(walletfind.balance) + parseFloat(price);

      // Update the wallet balance
      const wallettopup = await prisma.wallet.update({
        where: {
          uid: walletid,
        },
        data: {
          balance: newBalance.toString(), // Update the wallet balance
          iswalletrechargedone: true,
          recharger_made_by_which_user: userid,
        },
      });

      // Create a new record in the walletreachargehistory table
      const walletRechargeHistory = await prisma.walletreachargehistory.create({
        data: {
          uid: crypto.randomUUID(),
          userassociatedid: userid,
          previousbalance: walletfind.balance.toString(), // Store the previous balance
          balanceleft: newBalance.toString(), // Store the new balance
          addedbalance: price.toString(), // Store the added balance
          numberofrecharge: "1", // This can be incremented based on your logic
        },
      });

      // Return the response with the updated wallet and recharge history
      const messagetype = "success"
      const message = "Wallet reacharge done"
      const filelocation = "init_wallet_recharge.js"
      logging(messagetype,message,filelocation)
      return res.status(201).json({
        message: "Wallet recharge done",
        details: wallettopup,
        walletRechargeHistory: walletRechargeHistory,
      });
    } else {
      const messagetype = "error"
      const message = "No data found"
      const filelocation = "init_wallet_recharge.js"
      logging(messagetype,message,filelocation)
      return res.status(404).json({
        message: "No data found",
      });
    }
  } catch (error) {
    const messagetype = "error"
    const message = `An error occurred while recharging the wallet - ${error}`
    const filelocation = "init_wallet_recharge.js"
    logging(messagetype,message,filelocation)
    return res.status(500).json({
      message: `An error occurred while recharging the wallet - ${error}`,
      error: error,
    });
  }
};

export default rechargewallet;
