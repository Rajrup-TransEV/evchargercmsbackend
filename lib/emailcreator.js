import nodemailer from 'nodemailer';

const emailSender = async (email, subject, text) => {
    try {
        // Create a transporter for Nodemailer using Outlook
        const transporter = nodemailer.createTransport({
            service: 'Outlook365', // Use Outlook service
            auth: {
                user: process.env.OUTLOOK_EMAIL, // Your Outlook email
                pass: process.env.OUTLOOK_PASS  // Your Outlook email password
            }
        });

        // Define the email options
        const mailOptions = {
            from: process.env.OUTLOOK_EMAIL,
            to: email,
            subject: subject,
            text: text
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email}`);
    } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        throw new Error(`Failed to send email and the reason is :::  ${error}`);
    }
};

export default emailSender;