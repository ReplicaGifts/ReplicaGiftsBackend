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
        city: { type: String, required: true },
        country: { type: String, required: true },
        address: { type: String, required: true },

        postcode: { type: String, required: true },
        phone: { type: String, required: true },
    },

    shoppingCart: [{
        productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
        quantity: { type: String, required: true, default: 1 },
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