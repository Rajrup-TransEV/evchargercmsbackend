// models/RazorpayData.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createPayment = async (data) => {
  try {
    const payment = await prisma.razorpayData.create({
      data,
    });
    return payment;
  } catch (error) {
    throw new Error('Error creating payment record: ' + error.message);
  }
};

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

const findPaymentByOrderId = async (orderId) => {
  try {
    return await prisma.razorpayData.findUnique({
      where: { orderId },
    });
  } catch (error) {
    throw new Error('Error fetching payment record: ' + error.message);
  }
};

module.exports = {
  createPayment,
  updatePayment,
  findPaymentByOrderId,
};
