import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const todayrevenue = async (req, res) => {
  try {
    const today = new Date();
    // Set the start and end of the day
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Fetch all records created today
    const records = await prisma.walletreachargehistory.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
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
    res.json({ message:"Here is the total revenue for today",data: totalRevenue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while calculating revenue.' });
  } finally {
    await prisma.$disconnect();
  }
};
