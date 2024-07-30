import nodemailer from 'nodemailer';

const email_host = process.env.EMAIL_HOST
const email_port = process.env.EMAIL_PORT
const email_secure = process.env.EMAIL_SECURE
const rejectunauth = process.env.EMAIL_REJECTION
const emailSender = async (email, subject, text) => {
    try {
        // Create a transporter for Nodemailer using Outlook
        console.log("email sender user",process.env.OUTLOOK_EMAIL)
        console.log("email sender password",process.env.OUTLOOK_PASS )
        const transporter = nodemailer.createTransport({
            host: email_host,
            port: email_port,
            secure: email_secure, // Use true for port 465
            auth: {
                user: process.env.OUTLOOK_EMAIL,
                pass: process.env.OUTLOOK_PASS // Use app password if 2FA is enabled
            },
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: rejectunauth // Adjust as necessary for production
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