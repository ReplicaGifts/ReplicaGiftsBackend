const express = require('express');
const router = express.Router();
const User = require('../model/user.model');
const Product = require('../model/product.model');
const { userAuth } = require('../common/auth');



router.get('/wish', userAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('wishList').populate({
            path: 'wishList'
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, wishList: user.wishList });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred while retrieving user wishlist" });
    }
});


router.post("/add-wish/:id", userAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        user.wishList.push(req.params.id);

        user.save();

        res.status(200).json({ success: true, wishList: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "An error occurred while add to wish list" });
    }
})


router.delete('/remove-wish/:productId', userAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        // Find the user
        const user = await User.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if the product is in the wishlist
        const index = user.wishList.indexOf(productId);
        if (index === -1) {
            return res.status(404).json({ success: false, message: "Product not found in wishlist" });
        }

        // Remove the product from the wishlist array
        user.wishList.splice(index, 1);

        // Save the updated user document
        await user.save();

        res.status(200).json({ success: true, message: "Product removed from wishlist successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred while removing product from wishlist" });
    }
});


module.exports = router;