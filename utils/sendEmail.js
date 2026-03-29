import nodemailer from 'nodemailer';

/**
 * Send an email notification to the specified address.
 * 
 * @param {Object} options 
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.message - Email body text
 */
export const sendEmail = async ({ email, subject, message }) => {
    try {
        // Create a transporter using standard SMTP (configure via Gmail/custom host)
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Send mail
        const info = await transporter.sendMail({
            from: `"College Management System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            text: message, // plain text body
            html: `<p>${message.replace(/\n/g, '<br>')}</p>`, // basic HTML layout
        });

        console.log(`📩 Email sent successfully to ${email} (Message ID: ${info.messageId})`);
    } catch (error) {
        console.error(`❌ Failed to send email to ${email}. Error: ${error.message}`);
        console.warn('⚠️ Have you configured EMAIL_USER and EMAIL_PASS in your .env file?');
    }
};
