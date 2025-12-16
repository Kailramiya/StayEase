const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
  try {
    // Allow disabling email for testing/debugging
    if (process.env.EMAIL_DISABLED === 'true') {
      console.log(`[EMAIL DISABLED] Would send to ${email}: ${subject}`);
      return;
    }

    // Fail fast if SMTP is not configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email service not configured');
    }

    const port = Number(process.env.EMAIL_PORT);
    const isSecure = port === 465;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure: isSecure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 5000, // 5s
      socketTimeout: 5000, // 5s
      greetingTimeout: 3000, // 3s for initial greeting
      tls: {
        rejectUnauthorized: false, // allow self-signed if using dev mail servers
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: message,
    });
  } catch (error) {
    console.log('Email sending error:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
