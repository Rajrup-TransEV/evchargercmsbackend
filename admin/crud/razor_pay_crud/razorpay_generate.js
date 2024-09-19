// models/RazorpayData.js
import { PrismaClient } from '@prisma/client';
import Razorpay from 'razorpay';

const prisma = new PrismaClient();

const createPayment = async (customerName, customerEmail, customerContact, price) => {
    console.log("razorpay captured price", price);
    const razid = process.env.RAZOR_PAY_KEY
    const razsid = process.env.RAZOR_PAY_SECRET
    // Create an instance of Razorpay
    const razorpay = new Razorpay({
        key_id: razid,
        key_secret: razsid
    });

    // Create an order
    const orderData = {
        amount: price * 100, // Amount in paise (multiply by 100 to convert to paise)
        currency: 'INR',
        receipt: `receipt_${Math.random() * 10000}`, // Unique receipt ID
        notes: {
            address: 'Customer Address'
        }
    };

    try {
        const order = await razorpay.orders.create(orderData);
        
        // Return order details to the frontend
        return {
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: razorpay.key_id,
            name: 'Transmogrify Global Pvt. Ltd',
            description: 'Payment for Total Revenue',
            image: 'https://cdn.statically.io/img/transmogriffy.com/wp-content/uploads/2022/03/TWLD5456.jpg?w=1280&quality=100&f=auto',
            prefill: {
                name: customerName,
                email: customerEmail,
                contact: customerContact
            },
            theme: {
                color: '#F37254'
            }
        };
    } catch (error) {
        console.error('Error creating payment:', error);
        throw error; // Rethrow error for handling in calling function
    }
};

export default createPayment;
