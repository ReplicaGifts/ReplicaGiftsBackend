const { default: mongoose } = require("mongoose");

module.exports = mongoose.model('Contact', {
    name: String,
    email: String,
    message: String,
    subject: String,
    chreatedAt: { type: Date, default: Date.now() },
})