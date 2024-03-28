const { default: mongoose } = require("mongoose");

module.exports = mongoose.model('Product', {

    image: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    additionalInfo: [{ title: String, description: String }],
    totalrating: { type: Number, default: 0 },
    availablePrintSize: [{ width: Number, height: Number }],
    availablePrintType: [{ type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true }],
    createdAt: { type: Date, default: Date.now() },
    noOfPerchases: { type: Number, default: 0 },
    userImage: { type: Boolean, default: false },
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, default: 0 },
        comment: {
            type: String, required: true
        }
    }]
});