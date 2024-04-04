const express = require('express');
const router = express.Router();
const User = require('../model/user.model');
const Product = require('../model/product.model');
const { userAuth } = require('../common/auth');
const Frame = require('../model/frameDeatails.model');


router.post("/add-cart/:id", userAuth, async (req, res) => {
    const userId = req.user.id;
    const productId = req.params.id;
    console.log(req.body);
    const { quantity, frameId } = req.body;

    try {
        let user = await User.findById(userId);

        // If user doesn't exist, return an error
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        const product = await Product.findById(productId).select(['quantity', 'amount']);

        if (!product) {
            return res.status(404).send({ success: false, message: "Product not found" });
        }

        // if (+product.quantity < quantity) {
        //     return res.status(400).send({ success: false, message: "Product quantity is less than selected quantity" });
        // }


        let total = +product.amount * +quantity;

        console.log(total, product.amount, quantity);
        // Check if the product is already in the cart
        // const existingItem = user.shoppingCart.find(item => item.productId.toString() === productId);
        // if (existingItem) {
        //     existingItem.quantity += quantity;
        //     existingItem.total += total;
        // } else {
        user.shoppingCart.push({ productId, quantity, total, userWant: frameId });
        // }

        await user.save();

        res.status(200).send({ success: true, message: "Product saved successfully to cart" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Product could not be saved" });
    }
});

router.delete("/remove-item/:id", userAuth, async function (req, res) {
    const userId = req.user.id;
    const cartId = req.params.id;

    try {
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        const index = user.shoppingCart.findIndex(item => item._id.toString() === cartId);
        if (index === -1) {
            return res.status(404).send({ success: false, message: "Item not found in cart" });
        }

        Frame.deleteOne({ _id: user.shoppingCart[index].userWant }).then(() => { console.log("deleted") });

        user.shoppingCart.splice(index, 1);

        await user.save();

        res.status(200).send({ success: true, message: "Item removed from cart successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "An error occurred while removing item from cart" });
    }
});

router.post("/edit-quantity/:id", userAuth, async (req, res) => {
    const userId = req.user.id;
    const cartId = req.params.id;
    const { quantity } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        const item = user.shoppingCart.find(item => item._id.toString() === cartId);
        if (!item) {
            return res.status(404).send({ success: false, message: "Item not found in cart" });
        }

        const product = await Product.findById(item.productId).select(['quantity', 'amount']);

        if (!product) {
            return res.status(404).send({ success: false, message: "Product not found" });
        }

        // if (product.quantity < quantity) {
        //     return res.status(400).send({ success: false, message: "Product quantity is less than selected quantity" });
        // }


        const total = product.amount * quantity;
        let frame = await Frame.findById(item.userWant);

        frame.quantity = +quantity;


        let totalAmount = total;

        if (frame.gifts) {
            frame.gifts.map(f => { totalAmount += f.total })
        }

        frame.totalAmount = totalAmount;

        await frame.save();

        item.quantity = quantity;
        item.total = total;

        await user.save();

        res.status(200).send({ success: true, message: "Product quantity updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "An error occurred while updating product quantity" });
    }
});



router.get("/get-cart", userAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'shoppingCart',
            populate: [
                { path: 'productId' },
                {
                    path: 'userWant',
                    populate: {
                        path: 'gifts',
                        populate: {
                            path: 'gift'
                        }
                    }
                }
            ]
        }

        )

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json(user.shoppingCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred while retrieving user cart" });
    }
});



module.exports = router;
