//monthly recharge
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const monthlyRevenue = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // Fetch all records created this month
    const records = await prisma.walletreachargehistory.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Calculate total revenue
    let totalRevenue = 0;

    records.forEach(record => {
      // Parse addedbalance from string to float
      const addedBalance = parseFloat(record.addedbalance);
      if (!isNaN(addedBalance)) {
        totalRevenue += addedBalance;
      }
    });

    // Send the total revenue as a response
    res.json({ data:totalRevenue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while calculating monthly revenue.' });
  } finally {
    await prisma.$disconnect();
  }
};
