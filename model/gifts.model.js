const { default: mongoose } = require("mongoose");

module.exports = mongoose.model("gift", {

    name: { type: String, requrired: true },
    thumbnail: { type: String, requrired: true },
    price: { type: Number, requrired: true },
    quantity: { type: Number, requrired: true },
    cheartedAt: { type: Date, default: Date.now() },

})