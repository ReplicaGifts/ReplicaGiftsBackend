const { default: mongoose } = require("mongoose");

module.exports = mongoose.model('Contact', {
    name: String,
    email: String,
    message: String,
    phone: String,
    subject: String,
    chreatedAt: { type: Date, default: Date.now() },
    isViewed: { type: Boolean, default: false },

});



