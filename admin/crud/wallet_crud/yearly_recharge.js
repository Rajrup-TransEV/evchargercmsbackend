import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const yearlyRevenue = async (req, res) => {
  try {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1); // January 1st of the current year
    const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999); // December 31st of the current year

    // Fetch all records created this year
    const records = await prisma.walletreachargehistory.findMany({
      where: {
        createdAt: {
          gte: startOfYear,
          lte: endOfYear,
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
    res.status(500).json({ error: 'An error occurred while calculating yearly revenue.' });
  } finally {
    await prisma.$disconnect();
  }
};
