const nodemailer = require('nodemailer');

const sendOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.us.appsuite.cloud",
      port: 465,
      secure: true, // Use SSL for port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER, // Make sure this is set correctly
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    return info; // Return email info for debugging
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error; // Ensure the calling function gets the error
  }
};

module.exports = sendOTP;
