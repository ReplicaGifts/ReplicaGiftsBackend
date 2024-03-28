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
    billingDetails: {
        name: String,
        email: String,
        city: { type: String, },
        country: { type: String, },
        address: { type: String, },
        state: { type: String, },
        postcode: { type: String, },
        phone: { type: String, },
    },

    shoppingCart: [{
        productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
        quantity: { type: Number, required: true, default: 1 },
        total: Number,
        userWant: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'FrameDetail' }
    }],

    wishList: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' }],


    orders: [{
        orderId: { type: String, required: true },
        date: { type: Date, default: Date.now() },
        status: { type: String, required: true },
        total: Number
    }]

});