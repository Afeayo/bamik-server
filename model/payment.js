const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    userName: { type: String, required: true },  // User's full name
    userEmail: { type: String, required: true },
    phone: { type: String, required: true },  // User's phone number
    referral: { type: String, required: true },  // How the user heard about the program
    amount: { type: Number, required: true },
    paystackFee: { type: Number, required: true },
    reference: { type: String, required: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    date: { type: Date, default: Date.now },
    message: { type: String },
});

module.exports = mongoose.model('Payment', PaymentSchema);
