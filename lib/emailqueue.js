import Bull from 'bull';
import emailSender from './emailcreator.js';
import logging from '../logging/logging_generate.js';
const host = process.env.REDIS_HOST
const username = process.env.REDIS_USERNAME
const password = process.env.REDIS_PASSWORD
const port = process.env.REDIS_PORT
const emailQueue = new Bull('emailQueue', {
    redis: {
        host: `${host}`,
        username: `${username}`,
        password: `${password}`,
        port: `${port}`,
        tls:true
    }
});

emailQueue.process(async (job) => {
    console.log("email quee hit request")
    const { to, subject, text } = job.data;
    const messagetype = "processing"
    const message = `Processing job:', ${JSON.stringify(job.data)}`
    const filelocation = "emailqueue.js"
    logging(messagetype,message,filelocation)
    console.log('Processing job:', job.data); // Log job data for debugging
    try {
        await emailSender(to, subject, text);
        const messagetype = "success"
        const message = `Email sent successfully to ${to}`
        const filelocation = "emailqueue.js"
        logging(messagetype,message,filelocation)
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        const messagetype = "error"
        const message = `Error sending email to ${to}: ${error.message}`
        const filelocation = "emailqueue.js"
        logging(messagetype,message,filelocation)
        console.error(`Error sending email to ${to}: ${error.message}`);
        // Rethrow error to mark the job as failed
        throw error;
    }
});

// Event listeners for job completion and failure
emailQueue.on('completed', (job) => {
    console.log(`Email job completed successfully: ${job.id}`);
});

emailQueue.on('failed', (job, err) => {
    console.error(`Email job failed: ${job.id}, Error: ${err.message}`);
});

// Log when the queue is ready
emailQueue.on('ready', () => {
    console.log('Email queue is ready to process jobs.');
});

export default emailQueue;
