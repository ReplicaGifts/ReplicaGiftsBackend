const router = require('express').Router();
const { userAuth, adminAuth } = require('../common/auth');
const upload = require('../common/fileUpload');

const FrameDetail = require('../model/frameDeatails.model');



router.get('/all', adminAuth, async (req, res) => {
    try {
        const frame = await FrameDetail.find({ status: true }).populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'product',
        });

        res.send(frame);
    } catch (error) {

        res.status(500).send(error.message);

    }
});


router.post("/add-frame", userAuth, upload.single('userImage'), async (req, res) => {

    const { product, printType, size, quantity } = req.body;

    let userImage;

    if (req.file) {
        userImage = `${req.protocol}://${req.get('host')}/${req.file.filename}`;
    }

    try {
        const frame = new FrameDetail({
            product, printType, size, quantity, userImage, user: req.user.id
        });

        await frame.save();

        res.send(frame);
    } catch (error) {

        res.status(500).send(error.message);
    }
});


router.get("/get/:id", async function (req, res) {

    try {
        const frame = await FrameDetail.findById(req.params.id).populate('product');

        res.send({ success: true, product: frame.product, quantity: frame.quantity });

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
        });


        res.send(orders);

    } catch (error) {

        res.status(500).send({ error: error.message, success: false });

    }
});


module.exports = router;

