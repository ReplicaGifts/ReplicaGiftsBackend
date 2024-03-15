const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();
const productRouter = require('./router/product');
const cartRouter = require('./router/shopcart');
const wishRouter = require('./router/wishList');
const adminRouter = require('./router/admin');
const userRouter = require('./router/user');
const categoryRouter = require('./router/category');


const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'uploads')));
app.use(cors());

app.use(bodyParser.json());
app.use(express.json());
app.use("/api/products", productRouter)
app.use("/api/carts", cartRouter);
app.use("/api/wishlist", wishRouter)
app.use("/api/admin", adminRouter)
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);


mongoose.connect(process.env.MONGOOS_KEY).then(() => {

    app.listen(port, (req, res) => {
        console.log("listening on port " + port + " http://localhost:" + port);
    });
})




