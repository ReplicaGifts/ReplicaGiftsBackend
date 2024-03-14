const mongoose = require('mongoose');

module.exports = mongoose.model("User", {
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profile: String,
    createdAt: {
        type: Date,
        default: Date.now()
    },
    address: [{ type: String }],

    shoppingCart: [{
        productId: { type: mongoose.Schema.Types.ObjectId, required: true, red: 'Product' },
        quantity: { type: String, required: true, default: 1 },
        total: Number
    }],

    wishList: [{ type: mongoose.Schema.Types.ObjectId, required: true, red: 'Product' }],


    orders: [{
        orderId: { type: String, required: true },
        date: { type: Date, default: Date.now() },
        status: { type: String, required: true },
        total: Number
    }]

});