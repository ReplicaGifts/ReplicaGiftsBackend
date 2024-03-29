const { default: mongoose } = require("mongoose");

module.exports = mongoose.model("category", {

    categoryName: { type: String, requrired: true },
    thumbnail: { type: String, requrired: true },
    printType: { type: Boolean, default: false },
    cheartedAt: { type: Date, default: Date.now() },
    frame: { type: Boolean, default: false }

})