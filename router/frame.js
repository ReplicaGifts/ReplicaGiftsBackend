const router = require('express').Router();
const { userAuth } = require('../common/auth');
const upload = require('../common/fileUpload');

const FrameDetail = require('../model/frameDeatails.model');



router.get('/', async (req, res) => {
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



module.exports = router;

