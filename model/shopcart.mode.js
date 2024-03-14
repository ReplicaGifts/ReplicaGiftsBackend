const { default: mongoose } = require("mongoose");

module.exports = mongoose.model("shopCart", {

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },

    createdAt: { type: Date, default: Date.now() },

    quantity: { type: Number, default: 1 },


})