const router = require('express').Router();
const { adminAuth } = require('../common/auth');
const { uploadToS3 } = require('../common/aws.config');
const upload = require('../common/fileUpload');
const Gift = require('../model/gifts.model');




router.get("/", async (req, res) => {

    try {
        const gift = await Gift.find();

        res.send(gift);

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

});



router.post('/', adminAuth, upload.single("thumbnail"), async (req, res) => {

    const { name, quantity, price } = req.body;

    try {
        if (!req.file) {
            res.status(404).send({ success: false, message: "Thumbnail not found" });
        }
        let thumbnail = `${req.protocol}://${req.get('host')}/${req.file.filename}`;

        // let thumbnail = await uploadToS3(req.file);
        const gift = new Gift({
            name, quantity, price, thumbnail
        });

        await gift.save();

        res.send({ success: true, message: "gift added successfully", gift })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message })

    }
});

router.put('/update/:id', adminAuth, upload.single("thumbnail"), async (req, res) => {

    let { name, quantity, price, thumbnail } = req.body;

    const id = req.params.id;

    try {
        if (req.file) {
            thumbnail = `${req.protocol}://${req.get('host')}/${req.file.filename}`
            // thumbnail = await uploadToS3(req.file)
        }
        const gift = await Gift.findByIdAndUpdate(id, {
            name, quantity, price, thumbnail
        }, { new: true });

        res.send({ success: true, message: "gift updated successfully", gift })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message })

    }
});

router.delete("/delete/:id", async (req, res) => {


    try {
        const gifts = await Gift.findByIdAndDelete(req.params.id);


        // await deleteFromS3(gifts.thumbnail);
        res.send({ success: true, message: 'deleted successfully' });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }


});




module.exports = router;