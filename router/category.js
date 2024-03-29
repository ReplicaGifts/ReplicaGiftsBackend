const router = require('express').Router();
const { adminAuth } = require('../common/auth');
const { uploadToS3 } = require('../common/aws.config');
const upload = require('../common/fileUpload');
const Category = require('../model/category.model');




router.post("/add-category", upload.single("thumbnail"), async (req, res) => {

    const { categoryName, frame } = req.body;

    try {

        if (!req.file) return res.status(404).send({ message: "thubnail is required", success: false });

        let thumbnail = `${req.protocol}://${req.get('host')}/${req.file.filename}`;
        // let thumbnail = await uploadToS3(req.file)

        const category = new Category({
            categoryName,
            frame,
            thumbnail
        });

        await category.save();

        res.send(category);

    } catch (error) {

        res.status(500).send({ success: false, message: error.message });

    }

});



router.get('/category-only', async function (req, res) {

    try {

        const category = await Category.find({ printType: false });

        res.send(category);

    } catch (error) {

        res.status(500).send({ success: false, err: error.message });

    }

});





router.get('/all', async function (req, res) {

    try {

        const category = await Category.find();

        res.send(category);

    } catch (error) {

        res.status(500).send({ success: false, err: error.message });

    }

});




router.put("/update/:id", upload.single("thumbnail"), async (req, res) => {

    let { categoryName, frame } = req.body;
    const id = req.params.id;

    console.log(categoryName);

    try {

        let thumbnail = req.body.thumbnail;

        if (req.file) {

            thumbnail = `${req.protocol}://${req.get('host')}/${req.file.filename}`;
            // thumbnail = await uploadToS3(req.file);
        }

        if (!frame) {
            frame = false;
        }

        const category = await Category.findByIdAndUpdate(id, { $set: { categoryName, thumbnail, frame } }, { new: true });

        res.send({ success: true, message: "category updated succesfully", category });

    } catch (error) {

        res.status(500).send({ success: false, message: error.message });

    }

});


router.delete("/delete/:id", adminAuth, async function (req, res) {

    const id = req.params.id;

    try {

        await Category.deleteOne({ _id: id });

        res.send({ success: true, message: "category deleted successfully" });

    } catch (error) {

        res.status(500).send({ success: false, message: error.message });

    }
});


router.post('/printType', upload.single("thumbnail"), async (req, res) => {
    const { categoryName } = req.body;

    try {

        let thumbnail = `${req.protocol}://${req.get('host')}/${req.file.filename}`;

        const category = new Category({
            categoryName,
            printable: true,
            thumbnail
        });

        await category.save();

        res.send(category);

    } catch (error) {

        res.status(500).send({ success: false, message: error.message });

    }
})



router.get('/printType', async function (req, res) {

    try {

        const category = await Category.find({ printType: true });

        res.send(category);

    } catch (error) {

        res.status(500).send({ success: false, err: error.message });

    }

});


module.exports = router;
