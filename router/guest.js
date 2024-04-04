const express = require('express');
const router = express.Router();
const User = require('../model/user.model');
const Product = require('../model/product.model');
const { userAuth } = require('../common/auth');
const Frame = require('../model/frameDeatails.model');
const upload = require('../common/fileUpload');
const paymentController = require('../controllers/paymentController');
const { uploadToS3 } = require('../common/aws.config');
const Gift = require('../model/gifts.model');

router.put("/frame-quantity/:id", async (req, res) => {
    const frameId = req.params.id;
    console.log(frameId)
    const { quantity } = req.body;

    try {

        let frame = await Frame.findById(frameId).populate({
            path: 'gifts',
            populate: {
                path: 'gift'
            }
        })
        const product = await Product.findById(frame.product).select(['quantity', 'amount']);

        if (!product) {
            return res.status(404).send({ success: false, message: "Product not found" });
        }

        // if (product.quantity < quantity) {
        //     return res.status(400).send({ success: false, message: "Product quantity is less than selected quantity" });
        // }


        frame.quantity = +quantity;


        let totalAmount = product.amount * quantity;

        if (frame.gifts) {
            frame.gifts.map(f => { totalAmount += f.total })
        }

        frame.totalAmount = totalAmount;
        console.log(frame)

        await frame.save();


        res.status(200).send({ success: true, message: "Product quantity updated successfully", frame });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "An error occurred while updating product quantity" });
    }
});

const up = upload.fields([
    { name: 'userImage', maxCount: 1 },
    { name: 'userImageModel', maxCount: 1 },
])



router.post("/add-frame", up, async (req, res) => {

    let { product, printType, size, quantity, gifts, user } = req.body;

    if (!product || !printType || !size || !quantity) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    // Parse gifts if provided
    let totalAmount = 0;
    if (gifts) {
        gifts = JSON.parse(gifts);

        console.log(gifts);

        await gifts.map(gf => totalAmount += gf.total);
    }

    const prod = await Product.findById(product);

    totalAmount += prod.amount * quantity

    let userImage;

    if ('userImage' in req.files) {
        userImage = `${req.protocol}://${req.get('host')}/${req.files['userImage'][0].filename}`;
        // userImage = await Promise.all(uploadToS3(req.files['userImage'][0]));
    }
    let userImageModel;

    if ('userImageModel' in req.files) {
        userImageModel = `${req.protocol}://${req.get('host')}/${req.files['userImageModel'][0].filename}`;
        // userImageModel = await Promise.all(uploadToS3(req.files['userImageModel'][0]));
    }


    try {
        const frame = new Frame({
            product, printType, size, quantity, userImage, guest: user, gifts, totalAmount, userImageModel
        });

        await frame.save();

        let f = await Frame.findById(frame._id).populate({
            path: 'product'
        }).populate({
            path: 'gifts',
            populate: {
                path: 'gift'
            }
        });

        console.log(f)

        res.send(f);
    } catch (error) {

        res.status(500).send(error.message);
    }
});



router.delete('/remove/:id', async function (req, res) {
    Frame.deleteOne({ _id: req.params.id }).then((value) => {
        console.log(value);
        res.send({ success: true, message: 'order deleted successfully' });
    }).catch((e) => { res.status(500).send({ success: false, message: e.message }) })
});

router.post('/createOrder', (req, res, next) => { req['user'] = { id: '' }; next() }, paymentController.createOrder);

router.post('/verifyPayment', async (req, res) => {
    const { frameIds, orderId, paymentId, signature, user } = req.body;

    // Verify the payment signature
    const isValidSignature = paymentController.verifyRazorpaySignature(orderId, paymentId, signature);

    console.log(isValidSignature, "asdjlakdjsausd")
    if (isValidSignature) {

        const frames = await Frame.find({ guest: user });

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


                for (const g of frame.gifts) {
                    const gift = await Gift.findById(g.gift);

                    gift.quantity -= +g.quantity;

                    await gift.save();

                }

                // Update product quantity
                const product = await Product.findById(frame.product);

                if (product) {
                    // Ensure that quantity is defined and perform update operation
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
            // await cart.save();
        }

        res.status(200).json({ success: true, message: 'Payment signature verified successfully.' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid payment signature.' });
    }
});



router.get('/orders/:id', async function (req, res) {

    try {
        const orders = await Frame.find({ guest: req.params.id }).populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'product',
        }).populate({
            path: 'gifts',
            populate: {
                path: 'gift'
            }
        });


        res.send(orders);
    } catch (error) {
        res.status(500).send({ error: error.message, success: false });

    }

});


module.exports = router