
const { default: mongoose } = require("mongoose");


module.exports = mongoose.model('FrameDetail', {

    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    guest: String,

    userImage: { type: String },
    printType: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },

    deliveryAddress: {},

    orderId: { type: String },

    deliveryStatus: { type: String, },
    gifts: [{

        gift: { type: mongoose.Schema.Types.ObjectId, ref: 'gift' },
        quantity: { type: Number, required: true },
        total: { type: Number, required: true }
    }
    ],


    totalAmount: { type: Number, },

    tracking_id: { type: String },

    status: { type: Boolean, default: false },
    isViewed: { type: Boolean, default: false },
    notify: { type: Boolean, default: false },
    chreatedAt: { type: Date, default: Date.now() },
});



