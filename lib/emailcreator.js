import nodemailer from 'nodemailer';
import logging from '../logging/logging_generate.js';

const emailSender = async (email, subject, text) => {
    try {
        // Hostinger SMTP configuration
        const transporter = nodemailer.createTransport({
            host: 'smtp.hostinger.com', // Hostinger SMTP server
            port: 465, // Port for TLS
            secure: true, // Use TLS
            auth: {
                user: process.env.HOSTINGER_EMAIL, // Your Hostinger email
                pass: process.env.HOSTINGER_PASS  // Your Hostinger email password
            }
        });

        // Define the email options
        const mailOptions = {
            from: process.env.HOSTINGER_EMAIL,
            to: email,
            subject: subject,
            text: text
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        const messagetype = "success"
        const message = `Email sent successfully to ${email}`
        const filelocation = "emailcreator.js"
        logging(messagetype,message,filelocation)
        console.log(`Email sent successfully to ${email}`);
    } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        const messagetype = "error"
        const message = `Failed to send email and the reason is: ${error}`
        const filelocation = "emailcreator.js"
        logging(messagetype,message,filelocation)
        throw new Error(`Failed to send email and the reason is: ${error.message}`);
    }
};

export default emailSender;
