const { default: mongoose } = require("mongoose");

module.exports = mongoose.model('Product', {
    thumbnail: { type: String, required: true },
    images: [{ type: String, required: true }],
    title: { type: String, required: true },
    price: { type: String, required: true },
    discount: { type: String, required: true },
    amount: { type: String, required: true },
    description: { type: String, required: true },
    additionalInfo: [{ title: String, description: String }],
    quantity: { type: Number, default: 1 },
    availablePrintSize: [{ width: Number, height: Number }],
    availablePrintType: [{ type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true }],
    createdAt: { type: Date, default: Date.now() },
    noOfPerchases: { type: Number, default: 0 },
    userImage: { type: Boolean, default: false }

});