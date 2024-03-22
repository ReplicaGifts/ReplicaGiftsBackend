const router = require('express').Router();
const { userAuth, adminAuth } = require('../common/auth');
const upload = require('../common/fileUpload');

const FrameDetail = require('../model/frameDeatails.model');
const Product = require('../model/product.model');
const Gift = require('../model/gifts.model');



router.get('/all', adminAuth, async (req, res) => {
    try {
        const frame = await FrameDetail.find({ status: true }).populate({
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

        res.send(frame);
    } catch (error) {

        res.status(500).send(error.message);

    }
});


router.post("/add-frame", userAuth, upload.single('userImage'), async (req, res) => {

    let { product, printType, size, quantity, gifts } = req.body;

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

    if (req.file) {
        userImage = `${req.protocol}://${req.get('host')}/${req.file.filename}`;
    }

    try {
        const frame = new FrameDetail({
            product, printType, size, quantity, userImage, user: req.user.id, gifts, totalAmount
        });

        await frame.save();

        res.send(frame);
    } catch (error) {

        res.status(500).send(error.message);
    }
});


router.get("/get/:id", async function (req, res) {

    try {
        const frame = await FrameDetail.findById(req.params.id).populate('product').populate({
            path: 'gifts',
            populate: {
                path: 'gift'
            }
        });

        res.send({ success: true, product: frame.product, quantity: frame.quantity, gifts: frame.gifts, total: frame.totalAmount });

    } catch (error) {

        res.status(500).send({ error: error.message, success: false });

    }

});
router.get("/get-frame/:id", async function (req, res) {

    try {
        const frame = await FrameDetail.findById(req.params.id).populate({
            path: 'product'
        }).populate({
            path: 'user'
        }).populate({
            path: 'gifts',
            populate: {
                path: 'gift'
            }
        });

        res.send(frame);

    } catch (error) {

        res.status(500).send({ error: error.message, success: false });

    }

});


router.get("/orders", adminAuth, async (req, res) => {
    try {
        const orders = await FrameDetail.find({ status: true }).populate({
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

router.get('/user-orders', userAuth, async function (req, res) {

    try {
        const orders = await FrameDetail.find({ user: req.user.id }).populate({
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


module.exports = router;

