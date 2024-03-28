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

        const result = await FrameDetail.updateMany(
            { status: true },
            { $set: { notify: true } }
        );


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
        }).sort({ createdAt: -1 })

        // Split the orders array into two arrays
        const recentlyAdded = orders.filter(ord => !ord.isViewed); // Get the first 4 elements or less
        const remainingOrders = orders.filter(ord => ord.isViewed);

        res.send({ recentlyAdded, remainingOrders, orders });

    } catch (error) {

        res.status(500).send({ error: error.message, success: false });

    }
});



router.post('/notified/:id', adminAuth, async (req, res) => {
    try {
        const frame = await FrameDetail.findByIdAndUpdate(req.params.id, { $set: { notify: true } });
        console.log('f')
        res.send({ success: true, frame });
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: error, success: false });
    }
})

router.get('/notify', async function (req, res) {
    try {
        const count = await FrameDetail.countDocuments({ notify: false });
        console.log(count, "contur::");
        res.json({ count });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.post('/viewed/:id', adminAuth, async function (req, res) {
    try {
        const order = await FrameDetail.findByIdAndUpdate(req.params.id, { $set: { isViewed: true } });


        res.send({ success: true, order });

    } catch (error) {
        res.status(500).send({ success: false, error: error.message });

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


router.put('/:id/delivery-status', adminAuth, async function (req, res) {

    const status = req.body.status;


    try {
        if (!status) {
            return res.status(404).send({ message: 'Stattus Not Found' });
        }

        const order = await FrameDetail.findByIdAndUpdate(req.params.id, { $set: { deliveryStatus: status } });

        res.send({ success: true, order });

    } catch (error) {
        res.status(500).send({ error: error.message, success: false });
    }
});


router.put('/:id/tracking-id', adminAuth, async (req, res) => {
    const id = req.body.trackingId;


    try {
        if (!id) {
            return res.status(404).send({ message: 'Tracking id  Not Found' });
        }

        const order = await FrameDetail.findByIdAndUpdate(req.params.id, { $set: { tracking_id: id } });

        res.send({ success: true, order });

    } catch (error) {
        res.status(500).send({ error: error.message, success: false });
    }
})

module.exports = router;

