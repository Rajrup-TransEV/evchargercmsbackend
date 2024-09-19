// transactionDetails.mjs
import { PrismaClient } from '@prisma/client';
import logging from '../../../logging/logging_generate.js';

const prisma = new PrismaClient();

const totalrevenue = async (req, res) => {
  const { userId } = req.body; // Assuming userId is passed as a URL parameter

  try {
    // Fetch all records for the specified user
    const records = await prisma.walletreachargehistory.findMany({
      where: {
        userassociatedid: userId, // Filter by user ID
      },
    });

    // Calculate the total added balance by converting strings to numbers
    const totalAddedBalance = records.reduce((sum, record) => {
      const addedBalanceValue = parseFloat(record.addedbalance) || 0; // Convert to float, default to 0 if NaN
      return sum + addedBalanceValue; // Sum up the values
    }, 0);

    // Log and return the result
    const messagetype = "success";
    const message = `Total added balance for user ${userId}: ${totalAddedBalance}`;
    const filelocation = "transactionDetails.mjs";
    logging(messagetype, message, filelocation);

    return res.status(200).json({ totalrevenues:totalAddedBalance });
  } catch (error) {
    console.error(error);
    
    // Log error details
    const messagetype = "error";
    const message = `Error calculating total revenue for user ${userId}: ${error.message}`;
    const filelocation = "transactionDetails.mjs";
    logging(messagetype, message, filelocation);

    return res.status(500).json({ message: "Internal server error" });
  }
};

export default totalrevenue;
