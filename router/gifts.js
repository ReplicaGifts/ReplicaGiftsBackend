const router = require('express').Router();
const { adminAuth } = require('../common/auth');
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
        let thumbnail = `${req.protocol}://${req.get('host')}/${req.file.filename}`
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
        }
        const gift = await Gift.findByIdAndUpdate(id, {
            name, quantity, price, thumbnail
        }, { new: true });

        res.send({ success: true, message: "gift updated successfully", gift })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message })

    }
});

router.delete("/delete/:id", (req, res) => {


    Gift.deleteOne({ _id: req.params.id }).then(() => {

        res.status(200).send({ success: true, message: "gift deleted successfully" });
    }).catch(err => {

        res.status(500).send({ success: false, message: err.message });
    });


});




module.exports = router;