

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    tel: String,

    emailVerified: { type: Boolean, default: false },

    paymentMethod: String, // "paystack" | "bank"
    paymentStatus: {
        type: String,
        default: "pending", // pending | paid
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("User", userSchema);








/*const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    tel: String,
    emailVerified: Boolean
}, { timestamps: true }); 

module.exports = mongoose.model('User', userSchema);
*/


