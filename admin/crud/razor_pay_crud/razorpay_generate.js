// models/RazorpayData.js
// payment.mjs
import { PrismaClient } from '@prisma/client';
import Razorpay from 'razorpay';

const prisma = new PrismaClient();
// const customerName = "rajrup das"
// const customerEmail="transmogrify17@outlook.com"
// const customerContact = "9836471882"
const  createPayment = (customerName, customerEmail, customerContact)=> {
  const options = {
      key: 'rzp_test_Oxv2YtjPuwWXJL', // Replace with your Razorpay live key
      amount: this.totalRevenue * 100, // Amount in paise (multiply by 100 to convert to paise)
      currency: 'INR',
      name: 'Transmogrify Global Pvt. Ltd',
      description: 'Payment for Total Revenue',
      image: 'https://cdn.statically.io/img/transmogriffy.com/wp-content/uploads/2022/03/TWLD5456.jpg?w=1280&quality=100&f=auto',
      handler: (response) => {
          alert('Payment successful. Payment ID: ' + response.razorpay_payment_id);
          // Add logic to handle payment success (e.g., update database, show success message)
      },
      prefill: {
          name: customerName, // Custom parameter for customer name
          email: customerEmail, // Custom parameter for customer email
          contact: customerContact // Custom parameter for customer contact
      },
      notes: {
          address: 'Customer Address'
      },
      theme: {
          color: '#F37254'
      }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}
export default createPayment;

