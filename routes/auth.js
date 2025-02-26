const express = require('express');
const router = express.Router();
const User = require('../model/user');
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');

// Send OTP to user's email
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    const otp = speakeasy.totp({
        secret: process.env.OTP_SECRET,
        digits: 6
    });

    const user = await User.findOneAndUpdate(
        { email },
        { otp, otpExpires: Date.now() + 300000 }, 
        { upsert: true, new: true }
    );

    // Email Transporter
let transporter = nodemailer.createTransport({
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
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It expires in 5 minutes.`
    });

    res.json({ message: "OTP sent to email" });
});

// Verify OTP entered by the user
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP Verified" });
});

module.exports = router;
