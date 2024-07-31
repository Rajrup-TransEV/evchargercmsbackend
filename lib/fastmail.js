import nodemailer from 'nodemailer';

const emailSender = async (email, subject, text) => {
    try {
        // Fastmail SMTP configuration
        const transporter = nodemailer.createTransport({
            host: 'smtp.fastmail.com', // Fastmail SMTP server
            port: 465, // Port for SSL
            secure: true, // Use SSL
            auth: {
                user: process.env.FASTMAIL_EMAIL, // Your Fastmail email
                pass: process.env.FASTMAIL_PASS  // Your Fastmail email password
            }
        });

        // Define the email options
        const mailOptions = {
            from: process.env.FASTMAIL_EMAIL,
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
