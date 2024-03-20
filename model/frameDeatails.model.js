const { default: mongoose } = require("mongoose");

module.exports = mongoose.model('FrameDetail', {

    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    userImage: { type: String },
    printType: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },

    deliveryAddress: {},

    orderId: { type: String },

    deliveryStatus: { type: String, },

    status: { type: Boolean, default: false },

})