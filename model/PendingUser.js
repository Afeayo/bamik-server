const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    fullname: { type: String, required: true },
    phone: { type: String, required: true },
    otp: { type: String, required: true },
    otpExpires: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model("PendingUser", pendingUserSchema);
