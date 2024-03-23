const Razorpay = require('razorpay');
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
require('dotenv').config();
const FrameDetail = require('../model/frameDeatails.model');
const crypto = require('crypto');

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

const renderProductPage = async (req, res) => {

    try {
        res.render('product');

    } catch (error) {
        console.log(error.message);
    }

}

const createOrder = async (req, res) => {
    try {
        // Find frame details for the user
        const frames = await FrameDetail.find({ user: req.user.id });
        console.log(req.body);

        const frameDetails = [];

        // Iterate over each frame ID in the request body
        for (let i = 0; i < req.body.frameId.length; i++) {
            const frameId = req.body.frameId[i];

            // Find the corresponding frame detail
            const frame = frames.find(f => f._id.toString() === frameId._id.toString());

            // Update delivery address for the frame
            if (frame) {
                console.log(frame);
                frame.deliveryAddress = req.body.data;
                frameDetails.push(frame._id);
                // Save the updated frame (if necessary)
                await frame.save();
            }
        }

        // Calculate the amount (assuming it's in paisa for INR)
        const amount = req.body.amount * 100;

        // Create options for Razorpay order
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: 'razorUser@gmail.com'
        };

        // Create order using Razorpay
        razorpayInstance.orders.create(options, (err, order) => {
            if (!err) {


                return res.status(200).send({
                    success: true,
                    msg: 'Order Created',
                    order_id: order.id,
                    amount: amount,
                    key_id: RAZORPAY_ID_KEY,
                    product_name: req.body.name,
                    description: req.body.description,
                    contact: "8567345632",
                    name: "Sandeep Sharma",
                    email: "sandeep@gmail.com",
                    frameDetails
                });
            } else {
                console.error(err);
                return res.status(400).send({ success: false, msg: 'Something went wrong!' });
            }
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).send({ success: false, msg: 'Internal server error' });
    }
};



function verifyRazorpaySignature(orderId, paymentId, signature) {
    // Concatenate order ID and payment ID
    const data = orderId + "|" + paymentId;

    // Create HMAC-SHA256 hash using secret key
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY);
    hmac.update(data);

    // Generate hexadecimal encoded signature
    const generatedSignature = hmac.digest('hex');

    // Compare generated signature with received signature
    return signature === generatedSignature;
}




module.exports = {
    renderProductPage,
    createOrder,
    verifyRazorpaySignature
}