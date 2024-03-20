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

    let { userImage, title, price, discount, description, additionalInfo, quantity, availablePrintSize, availablePrintType } = req.body;


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
            userImage, title, price, amount, discount, description, additionalInfo, availablePrintSize, availablePrintType, images, thumbnail,
        });

        await product.save();

        res.send({ success: true, product });

    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, error: error.message });

    }
});



const upld1 = upload.fields([{
    name: 'thumbnail',
    maxCount: 2
}, {
    name: 'images',
    maxCount: 20
}])

router.put("/update/:id", adminAuth, upld1, async (req, res) => {
    let { userImage, title, price, discount, description, additionalInfo, quantity, availablePrintSize, availablePrintType, thumbnail, images } = req.body;
    const id = req.params.id;

    console.log(req.files)

    console.log(req.body)

    if (availablePrintSize) {
        availablePrintSize = JSON.parse(availablePrintSize);
    }

    if (additionalInfo) {
        additionalInfo = JSON.parse(additionalInfo);
    }

    try {

        let amount = price;
        if (discount) {
            amount = price - (price * (discount / 100));
        }


        try {

            if ('images' in req.files)
                images = [...images, ...req.files["images"].map((image) => { return `${req.protocol}://${req.get('host')}/${image.filename}` })]
        } catch (e) {
            console.log(e);
        }

        try {

            if ('thumbnail' in req.files)
                thumbnail = `${req.protocol}://${req.get('host')}/${req.files['thumbnail'][0].filename}`
        } catch (e) {
            console.log(e);
        }

        const product = await Product.findByIdAndUpdate(id, {
            $set: {
                userImage, title, price, amount, discount, description, additionalInfo, quantity, availablePrintSize, availablePrintType, thumbnail, images
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

        res.send(product);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

});

router.get("/category/:categoryId", async (req, res) => {
    const category = req.params.categoryId; // Use req.params instead of req.query
    try {
        const result = await Product.find({ availablePrintType: { $in: [category] } }).populate('availablePrintType');
        res.json(result); // Send response
    } catch (e) {
        res.status(500).json({ error: e.message }); // Handle error
    }
});



router.get('/new-arrivals', async (req, res) => {
    try {
        // Retrieve newly arrived products based on the createdAt field, sorted in descending order
        const newProducts = await Product.find({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
            .sort({ createdAt: -1 })
            .populate('availablePrintType');
        res.json(newProducts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});



router.get('/trending-products', async (req, res) => {
    try {
        const trendingProducts = await Product.find({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
            .populate('availablePrintType') // Ensure 'availablePrintType' matches the model name you're referencing
            .sort({ noOfPerchases: -1 })
            .limit(10);
        console.log(trendingProducts)
        res.json(trendingProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/data/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("availablePrintType");
        res.send(product);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/out-of-stock', adminAuth, async (req, res) => {
    try {
        const product = await Product.find({ quantity: { $lt: 1 } });

        res.send(product);

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});




module.exports = router;