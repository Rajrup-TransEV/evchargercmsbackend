// verifyPayment.mjs
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const verifyPayment = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  const generated_signature = crypto.createHmac('sha256', 'YOUR_KEY_SECRET')
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    // Payment is successful
    await prisma.razorpayData.update({
      where: { orderId: razorpay_order_id },
      data: { status: 'captured', paymentId: razorpay_payment_id },
    });
    res.status(200).json({ status: 'success' });
  } else {
    // Payment verification failed
    res.status(400).json({ status: 'failure' });
  }
};

export default verifyPayment;
