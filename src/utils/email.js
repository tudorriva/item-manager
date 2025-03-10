const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // 2) Define email options
    const mailOptions = {
      from: 'Crud Test App <noreply@crud-test-app.com>',
      to: options.email,
      subject: options.subject,
      text: options.message
    };
    
    // Log email attempt
    console.log(`Attempting to send email to: ${options.email}`);
    console.log('Mail options:', { ...mailOptions, text: mailOptions.text.substring(0, 50) + '...' });
    console.log('Using transport:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: '****' // Hide password in logs
      }
    });
    
    // 3) Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Re-throw the error so the calling function can handle it
  }
};

module.exports = sendEmail;