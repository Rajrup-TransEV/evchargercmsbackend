import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const updatePayment = async (paymentId, updateData) => {
    try {
      const payment = await prisma.razorpayData.update({
        where: { paymentId },
        data: updateData,
      });
      
      return payment;
    } catch (error) {
      throw new Error('Error updating payment record: ' + error.message);
    }
  };
  