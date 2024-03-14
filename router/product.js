const router = require('express').Router();
const { adminAuth } = require('../common/auth');
const upload = require('../common/fileUpload');
const Product = require('../model/product.model');


const upld = upload.fields([{
    name: 'thumbnail',
    maxCount: 2
}, {
    name: 'images',
    maxCount: 20
}])

router.post("/add-product", upld, async (req, res) => {

    let { category, title, price, discount, description, additionalInfo, quantity, availablePrintSize, availablePrintType } = req.body;


    if (availablePrintSize) {
        availablePrintSize = JSON.parse(availablePrintSize);
    }

    if (additionalInfo) {
        additionalInfo = JSON.parse(additionalInfo);
    }

    if (!quantity) {
        quantity = 10;
    }

    try {

        let amount = price;
        if (discount) {
            amount = price - (price * (discount / 100));
        }

        if (!req.files['thumbnail']) {
            return res.status(404).send({ success: false, message: 'Product thumbnail not found ' })
        }

        if (!req.files['images']) {
            return res.status(404).send({ success: false, message: 'Product images not found ' })
        }

        const thumbnail = `${req.protocol}://${req.get('host')}/${req.files["thumbnail"][0].filename}`;

        let images = [];

        req.files['images'].map(image => {

            images.push(`${req.protocol}://${req.get('host')}/${image.filename}`)
        });




        const product = new Product({
            category, title, price, amount, discount, description, additionalInfo, availablePrintSize, availablePrintType, images, thumbnail,
        });

        await product.save();

        res.send({ success: true, product });

    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, error: error.message });

    }
});

router.put("/update/:id", adminAuth, upld, async (req, res) => {
    const { category, title, price, discount, description, additionalInfo, quantity, availablePrintSize, availablePrintType, thumbnail, images } = req.body;
    const id = req.params.id;

    try {

        let amount = price;
        if (discount) {
            amount = price - (price * (discount / 100));
        }

        if (typeof thumbnail === "object") {
            thumbnail = `${req.protocol}://${req.get('host')}/${req.files["thumbnail"][0].filename}`;
        }

        let j = 0;
        if (images) {
            images.map((image, i) => {
                if (typeof image === "object") {
                    images[i] = `${req.protocol}://${req.get('host')}/${req.files["images"][j++].filename}`
                }
            })
        }

        const product = await Product.findByIdAndUpdate(id, {
            $set: {
                category, title, price, amount, discount, description, additionalInfo, quantity, availablePrintSize, availablePrintType, thumbnail, images
            }
        });

        await product.save();

        res.send({ success: true, product });

    } catch (error) {

        res.status(500).send({ success: false, error: error.message });

    }
});


router.delete("/delete/:id", adminAuth, async (req, res) => {
    try {

        const product = await Product.deleteOne({ _id: req.params.id });

        res.status(200).send({ success: true, message: "Product deleted successfully" });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });

    }
});


router.get("/all", async (req, res) => {

    try {
        const product = await Product.find();

        res.send({ success: true, product: product });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

});


router.get('/new-arrivals', async (req, res) => {
    try {
        // Retrieve newly arrived products based on some criteria (e.g., createdAt field)
        const newProducts = await Product.find({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
        res.json(newProducts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/trending-products', async (req, res) => {
    try {
        const trendingProducts = await Product.find({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
            .sort({ sales: -1 })
            .limit(10);
        res.json(trendingProducts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});




module.exports = router;