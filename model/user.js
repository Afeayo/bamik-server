const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    tel: String,
    emailVerified: Boolean
});

module.exports = mongoose.model('User', userSchema);
