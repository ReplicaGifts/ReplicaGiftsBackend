const router = require('express').Router();
const { adminAuth, userAuth } = require('../common/auth');
const upload = require('../common/fileUpload');
const Product = require('../model/product.model');
const Category = require('../model/category.model');

const up = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'frame', maxCount: 1 },
])

router.post("/add-product", up, async (req, res) => {

    let { userImage, title, price, discount, description, category, additionalInfo, availablePrintSize, availablePrintType } = req.body;


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


        if (!'image' in req.files) {
            return res.status(404).send({ success: false, message: 'Product images not found ' })
        }

        const image = `${req.protocol}://${req.get('host')}/${req.files['image'][0].filename}`;

        let frame = '';

        if ('frame' in req.files) {
            frame = `${req.protocol}://${req.get('host')}/${req.files['frame'][0].filename}`;
        }

        const product = new Product({
            userImage, title, price, amount, discount, description, additionalInfo, frame, availablePrintSize, category, availablePrintType, image,
        });

        await product.save();

        res.send({ success: true, product });

    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, error: error.message });

    }
});





router.put("/update/:id", adminAuth, up, async (req, res) => {
    let { userImage, title, price, discount, description, category, additionalInfo, availablePrintSize, availablePrintType, image, frame } = req.body;
    const id = req.params.id;

    console.log(category)
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


        if ('image' in req.files) {
            image = `${req.protocol}://${req.get('host')}/${req.files['image'][0].filename}`;
        }



        if ('frame' in req.files) {
            frame = `${req.protocol}://${req.get('host')}/${req.files['frame'][0].filename}`;
        }

        const product = await Product.findByIdAndUpdate(id, {
            $set: {
                userImage, title, price, amount, discount, description, additionalInfo, category: category, availablePrintSize, availablePrintType, image, frame
            }
        }, { new: true });

        console.log(product);

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
        const product = await Product.find().populate('category');;

        res.send(product);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

});

router.get("/category/:categoryId", async (req, res) => {
    const category = req.params.categoryId; // Use req.params instead of req.query
    try {
        const result = await Product.find({
            $or: [
                { availablePrintType: { $in: [category] } },
                { category: category }
            ]
        }).populate(['availablePrintType', 'category']).limit(4);
        res.json(result); // Send response
    } catch (e) {
        res.status(500).json({ error: e.message }); // Handle error
    }
});



router.get('/new-arrivals', async (req, res) => {
    try {
        // Retrieve newly arrived products based on the createdAt field, sorted in descending order
        const newProducts = await Product.find()
            .sort({ createdAt: -1 })
            .limit(6)
            .populate(['availablePrintType', 'category'])
        res.json(newProducts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});



router.get('/trending-products', async (req, res) => {
    try {
        const trendingProducts = await Product.find({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
            .populate(['availablePrintType', 'category'])
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
        const product = await Product.findById(req.params.id).populate({
            path: 'availablePrintType'
        }).populate({
            path: 'category',
        });
        res.send(product);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// router.get('/out-of-stock', adminAuth, async (req, res) => {
//     try {
//         const product = await Product.find({ quantity: { $lt: 1 } });

//         res.send(product);

//     } catch (error) {
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });




router.get("/filter", async (req, res) => {
    try {
        const categories = await Category.find();

        const page = parseInt(req.query.page) - 1 || 0;
        const limit = parseInt(req.query.limit) || 12;
        const search = req.query.search || "";
        const sort = req.query.sort || "title";
        const order = req.query.order || 1;
        let category = req.query.category || "All";
        const rating = req.query.rating ? parseInt(req.query.rating) : undefined;
        const discount = req.query.discount ? parseInt(req.query.discount) : undefined;
        const min = parseInt(req.query.min) || 0;
        const max = parseInt(req.query.max) || Number.MAX_SAFE_INTEGER;

        category = category === "All" ? categories.map(cate => cate._id) : category;

        const sortBy = {};

        sortBy[sort] = Number.parseInt(order);

        const query = {
            title: { $regex: search, $options: "i" },
            amount: { $gte: min, $lte: max },
            $or: [
                { availablePrintType: { $in: category } },
                { category: { $in: category } }
            ]
        };

        if (rating !== undefined) {
            query.totalrating = rating;
        }

        if (discount !== undefined) {
            query.discount = { $gte: discount };
        }

        console.log(query);

        const product = await Product.find(query)
            .sort(sortBy)
            .skip(page * limit)
            .limit(limit).populate({
                path: 'category'
            });

        const total = await Product.countDocuments({
            ...query,
        });

        let totalPage = Math.ceil(total / limit);

        const response = {
            error: false,
            total: totalPage,
            page: page + 1,
            limit,
            category: categories,
            product
        };

        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }

});




router.get("/price-range", async function (req, res) {

    try {
        const product = await Product.find().sort({ amount: 1 });

        let prices = product.map(prod => +prod.amount);


        let maxDiscount = 0;
        let minDiscount = Number.MAX_SAFE_INTEGER;
        product.map(prod => { maxDiscount = Math.max(+prod.discount, maxDiscount); minDiscount = Math.min(+prod.discount, minDiscount); });

        res.send({ success: true, ranges: calculateUpperLimit(prices), maxDiscount: minDiscount, minDiscount: minDiscount });

    } catch (error) {
        res.send({ error: error.message, success: false });
    }

});

function calculateUpperLimit(prices) {
    const uniquePricesSet = new Set();
    uniquePricesSet.add(prices[0]);

    let j = prices[0] + 200;
    for (let i = 1; i <= prices.length; i++) {
        if (prices[i] > j) {
            j = prices[i] + 200;
        } else {
            uniquePricesSet.add(j);
        }
    }

    return Array.from(uniquePricesSet);
}


router.post('/add-review/:id', userAuth, async function (req, res) {

    const { rating, comment } = req.body;

    try {
        const product = await Product.findById(req.params.id).populate().populate({
            path: 'availablePrintType'
        }).populate({
            path: 'reviews',
            populate: {
                path: 'user',
                select: ['username', 'email']
            }
        });

        product.reviews.push({ rating, comment, user: req.user.id });

        const totalrating = await calculateAverageRating(product.reviews);

        console.log(totalrating);

        product.totalrating = totalrating;

        await product.save();

        res.send(product);

    } catch (error) {

        res.status(500).send({ success: false, message: error.message });

    }
});






function calculateAverageRating(reviews) {
    console.log(reviews)
    if (reviews.length === 0) {
        return 0;
    }


    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    console.log(totalRating);

    console.log(averageRating);

    return averageRating;
}



module.exports = router;