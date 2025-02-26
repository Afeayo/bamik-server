require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../model/user'); 
const axios = require('axios'); 
const https = require("https");

const router = express.Router();
let tempUsers = {}; // Temporary store for unverified users

// Function to generate a random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Nodemailer transporter 
const transporter = nodemailer.createTransport({
    host: 'smtp.us.appsuite.cloud',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send OTP email
async function sendOTPEmail(email, otp) {
    let mailOptions = {
        from:  process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification - Online Learning Platform',
        html: `<p>Your OTP for email verification is: <strong>${otp}</strong>. Enter this OTP to proceed with payment.</p>`
    };
    await transporter.sendMail(mailOptions);
}


const agent = new https.Agent({
    rejectUnauthorized: false,  // Ignore SSL errors
});


const initiatePayment = async (req, res) => {
    const { email } = req.body;

    try {
        const response = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email: email,
                amount: 50000 * 100, // Convert to kobo
                currency: "NGN",
                callback_url: "http://localhost:5000/payment-success",
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
                httpsAgent: agent, // 👈 Add this line
            }
        );

        res.json({ paymentLink: response.data.data.authorization_url });
    } catch (error) {
        console.error("Error initializing payment:", error);
        res.status(500).json({ message: "Payment initialization failed" });
    }
};



// Route: Initiate email verification
router.post('/register/initiate', async (req, res) => {
    const { name, email, tel } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered. Please log in.' });
        }

        const otp = generateOTP();
        tempUsers[email] = { name, email, tel, otp, emailVerified: false };

        await sendOTPEmail(email, otp);

        res.status(200).json({ message: 'OTP sent to email. Please verify.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error initiating registration.' });
    }
});

// Route: Verify email OTP
router.post('/register/verify-email', (req, res) => {
    const { email, otp } = req.body;
    const user = tempUsers[email];

    if (!user || user.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP. Try again.' });
    }

    user.emailVerified = true;
    res.status(200).json({ message: 'Email verified. Proceed to payment.' });
});




// Route: Initiate Paystack Payment
router.post('/register/pay', async (req, res) => {
    const { email } = req.body;
    const user = tempUsers[email];

    if (!user || !user.emailVerified) {
        return res.status(400).json({ message: 'Email not verified.' });
    }

    try {
        const paystackResponse = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: 50000 * 100, // Convert NGN to kobo
                callback_url: `${process.env.BASE_URL}/register/payment-success?email=${email}`
            },
            {
                headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
            }
        );

        res.json({ paymentLink: paystackResponse.data.data.authorization_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error initializing payment.' });
    }
});

// Route: Handle Payment Success
router.get('/register/payment-success', async (req, res) => {
    const { email } = req.query;
    const user = tempUsers[email];

    if (!user) {
        return res.status(400).json({ message: 'User not found or session expired.' });
    }

    try {
        const newUser = new User({
            name: user.name,
            email: user.email,
            tel: user.tel,
            emailVerified: true
        });

        await newUser.save();
        delete tempUsers[email];

        // Send confirmation email
        await transporter.sendMail({
            from:  process.env.EMAIL_USER,
            to: email,
            subject: 'Registration Successful - Online Learning Platform',
            html: `<p>Welcome ${user.name}, your registration is successful!</p>`
        });

        res.redirect(`${process.env.FRONTEND_URL}/success.html`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error completing registration.' });
    }
});

module.exports = router;
