import { PrismaClient } from '@prisma/client';
import Razorpay from 'razorpay';

const prisma = new PrismaClient();

// Create payment function expects an object with specific properties
const createPayment = async (paymentDetails) => {
    // Destructure required fields from paymentDetails
    const { firstname: customerName, email: customerEmail, address: customerAddress, price } = paymentDetails;

    console.log("Razorpay captured price", price);
    const razid = process.env.RAZOR_PAY_KEY;
    const razsid = process.env.RAZOR_PAY_SECRET;

    // Create an instance of Razorpay
    const razorpay = new Razorpay({
        key_id: razid,
        key_secret: razsid
    });

    // Create an order
    const orderData = {
        amount: price * 100, // Amount in paise (multiply by 100 to convert to paise)
        currency: 'INR',
        receipt: `receipt_${Math.floor(Math.random() * 10000)}`, // Unique receipt ID
        notes: {
            address: customerAddress // Use customerAddress for address
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
                contact: '', // Assuming contact is not provided; you may want to add this if available
            },
            theme: {
                color: '#F37254'
            }
        };
    } catch (error) {
        console.error('Error creating payment:', error);
        throw new Error(`Payment creation failed - ${error.message}`); // More informative error message
    }
};

export default createPayment;
