const { default: mongoose } = require("mongoose");

module.exports = mongoose.model("category", {

    categoryName: { type: String, requrired: true },
    thumbnail: { type: String, requrired: true },

})