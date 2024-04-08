const router = require('express').Router();
const { adminAuth, userAuth } = require('../common/auth');
const upload = require('../common/fileUpload');
const Product = require('../model/product.model');
const Category = require('../model/category.model');
const Orders = require('../model/frameDeatails.model');
const User = require('../model/user.model');
const { s3 } = require('../common/aws.config');
const { uploadToS3, deleteFromS3 } = require('../common/aws.config');

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

        amount = parseFloat(amount.toFixed(2));


        if (!'image' in req.files) {
            return res.status(404).send({ success: false, message: 'Product images not found ' })
        }
        // const image = await Promise.all(uploadToS3(req.files['image'][0]));
        const image = `https://replicagiftsbackend.onrender.com/${req.files['image'][0].filename}`;

        let frame = '';

        if ('frame' in req.files) {
            // frame = await Promise.all(uploadToS3(req.files['frame'][0]));

            frame = `https://replicagiftsbackend.onrender.com/${req.files['frame'][0].filename}`;
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
    // router.post("/add-product", upload.single("image"), async (req, res) => {

    //     let { userImage, title, price, discount, description, category, additionalInfo, availablePrintSize, availablePrintType } = req.body;

    //     if (availablePrintSize) {
    //         availablePrintSize = JSON.parse(availablePrintSize);
    //     }

    //     if (additionalInfo) {
    //         additionalInfo = JSON.parse(additionalInfo);
    //     }

    //     try {
    //         let amount = price;
    //         if (discount) {
    //             amount = price - (price * (discount / 100));
    //         }

    //         if (!req.file) {
    //             return res.status(404).send({ success: false, message: 'Product images not found ' })
    //         }

    //         // Upload image to AWS S3 bucket
    //         const uploadParams = {
    //             Bucket: 'your-bucket-name',
    //             Key: req.file.filename,
    //             Body: req.file.buffer
    //         };

    //         const s3Data = await s3.upload(uploadParams).promise();

    //         const imageUrl = s3Data.Location;

    //         const product = new Product({
    //             userImage, title, price, amount, discount, description, additionalInfo, availablePrintSize, category, availablePrintType, image: imageUrl,
    //         });

    //         await product.save();

    //         res.send({ success: true, product });

    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ success: false, error: error.message });
    //     }
    // });





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

        amount = parseFloat(amount.toFixed(2));

        const product = await Product.findById(id);


        if ('image' in req.files) {
            image = `https://${req.get('host')}/${req.files['image'][0].filename}`;
            //  image = await Promise.all(uploadToS3(req.files['image'][0]));
            // await deleteFromS3(product.image);


        }



        if ('frame' in req.files) {
            // frame = await Promise.all(uploadToS3(req.files['frame'][0]));

            frame = `https://${req.get('host')}/${req.files['frame'][0].filename}`;
            // await deleteFromS3(product.frame);
        }


        product.userImage = userImage;
        product.title = title;
        product.price = price;
        product.amount = amount;
        product.discount = discount;
        product.description = description;
        product.additionalInfo = additionalInfo;
        product.category = category;
        product.availablePrintSize = availablePrintSize;
        product.availablePrintType = availablePrintType;


        product.image = image;
        product.frame = frame;

        await product.save();


        console.log(product);

        res.send({ success: true, product });

    } catch (error) {

        res.status(500).send({ success: false, error: error.message });

    }
});


router.delete("/delete/:id", adminAuth, async (req, res) => {
    try {

        const order = await Orders.find({ product: req.params.id });

        let ordered_user = await Promise.all(order.filter((product) => {
            if (product.status) {
                return product;
            }
            return false;
        }));



        if (ordered_user.length > 0) {
            return res.send({ success: false, message: 'This product has been ordered by some users', ordered_user });
        } else {
            await Orders.deleteMany({ product: req.params.id });
            order.map(async (product) => {
                // if (product.status) {
                //     ordered_user.push(product.deliveryAddress);
                // }

                if (product.user) {
                    let user = await User.findById(product.user);

                    user.shoppingCart = await Promise.all(user.shoppingCart.filter(shoppingCart => {
                        if (shoppingCart.productId.toString() === req.params.id) {
                            return false;
                        }
                        return true;
                    }));


                    user.wishWist = await Promise.all(user.wishList.filter(wish => {
                        if (wish.toString() === req.params.id) {
                            return false;
                        }
                        return true;
                    }));

                    await user.save();
                }

                // if (product.userImage) {
                //     // console.log(await deleteFromS3(product.userImage));

                // }

                // if (product.userImageModel) {
                //     // console.log(await deleteFromS3(product.userImageModel));

                // }

            });
            const product = await Product.findByIdAndDelete({ _id: req.params.id });

            // console.log(await deleteFromS3(product.image));

            return res.status(200).send({ success: true, message: "Product deleted successfully" });
        }






    } catch (error) {
        res.status(500).send({ success: false, message: error.message });

    }
});



// router.delete("/delete/:id", adminAuth, async (req, res) => {
//     try {
//         // Fetch the product to get the image URL
//         const product = await Product.findById(req.params.id);

//         // Extract the image filename from the image URL
//         const imageUrl = product.image;
//         const filename = imageUrl.split('/').pop(); // Extract filename from URL

//         // Delete the product from the database
//         await Product.deleteOne({ _id: req.params.id });

//         // Delete the image from the AWS S3 bucket
//         const deleteParams = {
//             Bucket: 'your-bucket-name',
//             Key: filename
//         };

//         await s3.deleteObject(deleteParams).promise();

//         res.status(200).send({ success: true, message: "Product and image deleted successfully" });
//     } catch (error) {
//         res.status(500).send({ success: false, message: error.message });
//     }
// });




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
        const discountMin = parseInt(req.query.discountMin) || 0;
        const discountMax = parseInt(req.query.discountMax) || 100;
        const min = parseInt(req.query.min) || 0;
        const max = parseInt(req.query.max) || Number.MAX_SAFE_INTEGER;

        category = category === "All" ? categories.map(cate => cate._id) : category;

        const sortBy = {};

        sortBy[sort] = Number.parseInt(order);

        const query = {
            title: { $regex: search, $options: "i" },
            amount: { $gte: min, $lte: max },
            discount: { $gte: discountMin, $lte: discountMax },
            $or: [
                { availablePrintType: { $in: category } },
                { category: { $in: category } }
            ]
        };

        if (rating !== undefined) {
            query.totalrating = rating;
        }


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
            count: total,
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