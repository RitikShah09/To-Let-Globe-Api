const nodemailer = require("nodemailer");

// Centralized email transporter function
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_ADDRESS,
      pass: process.env.MAIL_PASSWORD,
    },
  });
};

// Send Email Utility
exports.sendEmail = async (mailOptions) => {
  const transporter = createTransporter();
  return transporter.sendMail(mailOptions);
};
