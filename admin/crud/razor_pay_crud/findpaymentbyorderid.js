import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const findPaymentByOrderId = async (orderId) => {
    try {
      return await prisma.razorpayData.findUnique({
        where: { orderId },
      });
    } catch (error) {
      throw new Error('Error fetching payment record: ' + error.message);
    }
  };
  