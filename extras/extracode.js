// {
//   const options = {
//     key: '', // Replace with your Razorpay test key
//     amount: this.totalRevenue * 100, // Amount in paise (multiply by 100 to convert to paise)
//     currency: 'INR',
//     name: 'Transmogrify Global Pvt. Ltd',
//     description: 'Payment for Total Revenue',
//     image: 'https://cdn.statically.io/img/transmogriffy.com/wp-content/uploads/2022/03/TWLD5456.jpg?w=1280&quality=100&f=auto',
//     handler: (response: any) => {
//       alert('Payment successful. Payment ID: ' + response.razorpay_payment_id);
//       // Add logic to handle payment success (e.g., update database, show success message)
//     },
//     prefill: {
//       name: 'Customer Name',
//       email: 'customer@example.com',
//       contact: '9999999999'
//     },
//     notes: {
//       address: 'Customer Address'
//     },
//     theme: {
//       color: '#F37254'
//     }
//   };

//   const rzp = new Razorpay(options);
//   rzp.open();
// }

// const createPayment = async (req, res) => {
//   const { amount, currency, receipt } = req.body;

//   try {
//     // Step 1: Create an order in Razorpay
//     const order = await razorpay.orders.create({
//       amount: amount * 100, // Amount in paise
//       currency,
//       receipt,
//     });

//     // Step 2: Save order details to the database
//     const payment = await prisma.razorpayData.create({
//       data: {
//         orderId: order.id,
//         amount: order.amount,
//         currency: order.currency,
//         receipt: order.receipt,
//         status: 'created',
//       },
//     });

//     // Step 3: Send the order details back to the client
//     res.status(200).json({
//       id: order.id,
//       currency: order.currency,
//       amount: order.amount,
//       key: razorpay.key_id, // Send Razorpay key ID to the client
//     });
//   } catch (error) {
//     console.error('Error creating payment record:', error);
//     res.status(500).send('Error creating payment record: ' + error.message);
//   }

// };

export default createPayment;
