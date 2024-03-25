const payment_route = require('express').Router();
const Frame = require('../model/frameDeatails.model');
const User = require('../model/user.model');
const Product = require('../model/product.model');

const paymentController = require('../controllers/paymentController');
const { userAuth } = require('../common/auth');

payment_route.get('/', userAuth, paymentController.renderProductPage);
payment_route.post('/createOrder', userAuth, paymentController.createOrder);


payment_route.post('/verifyPayment', userAuth, async (req, res) => {
    const { frameIds, orderId, paymentId, signature } = req.body;

    // Verify the payment signature
    const isValidSignature = paymentController.verifyRazorpaySignature(orderId, paymentId, signature);


    if (isValidSignature) {

        const frames = await Frame.find({ user: req.user.id });
        const cart = await User.findById(req.user.id);

        for (let i = 0; i < frameIds.length; i++) {
            const frameId = frameIds[i];

            // Find the corresponding frame detail
            const frame = frames.find(f => f._id.toString() === frameId.toString());
            console.log(frame, "hy")
            if (frame) {
                // Update delivery status and order ID for the frame

                console.log(frame, "sadasd")
                frame.status = true;
                frame.orderId = orderId;
                frame.chreatedAt = Date.now();
                // Remove frame from shopping cart
                const cartIndex = cart.shoppingCart.findIndex(item => item.userWant.toString() === frame._id.toString());
                if (cartIndex !== -1) {
                    cart.shoppingCart.splice(cartIndex, 1);
                }

                // Update product quantity
                const product = await Product.findById(frame.product);

                if (product) {
                    // Ensure that quantity is defined and perform update operation
                    product.quantity -= frame.quantity;
                    product.noOfPerchases += frame.quantity;
                    await product.save();
                } else {
                    // Handle case where product is not found
                    console.error("Product not found for frame:", frameId);
                    // Optionally, you can roll back the transaction or handle the situation based on your application logic
                }

                // Save the updated frame
                await frame.save();
            }
            await cart.save();
        }

        res.status(200).json({ success: true, message: 'Payment signature verified successfully.' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid payment signature.' });
    }
});


module.exports = payment_route;
