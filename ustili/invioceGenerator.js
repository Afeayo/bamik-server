const nodemailer = require('nodemailer');

const sendInvoice = async (email, amount, reference, name) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.us.appsuite.cloud",
        port: 465,
        secure: true, // Use SSL for port 465
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });


    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Payment Invoice",
        text: `Dear ${name},\n\nThank you for your payment of ₦${amount}.\nReference: ${reference}\n\nWelcome to our program!`
    });
};

module.exports = sendInvoice;






