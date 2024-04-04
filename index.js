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
const categoryRouter = require('./router/category');
const userRouter = require('./router/user');
const orderRouter = require('./router/order');
const frameRouter = require('./router/frame');
const profileRouter = require('./router/profile');
const giftsRouter = require('./router/gifts');
const trackRouter = require('./router/trackMore');
const guestRouter = require('./router/guest');
const mailRouter = require('./router/mail');


const app = express();
const port = 3000;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow access from any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE', 'HEAD'); // Allow the specified methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow the specified headers
    next();
});

app.use(cors());


app.use(express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use("/api/products", productRouter)
app.use("/api/carts", cartRouter);
app.use("/api/wishlist", wishRouter)
app.use("/api/admin", adminRouter)
app.use("/api/users", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/payment", orderRouter);
app.use("/api/frame", frameRouter);
app.use("/api/profile", profileRouter);
app.use("/api/gifts", giftsRouter);
app.use("/api/trackmore", trackRouter);
app.use("/api/guest", guestRouter);
app.use("/api/mail", mailRouter);


mongoose.connect(process.env.MONGOOS_KEY).then(() => {

    app.listen(port, (req, res) => {
        console.log("listening on port " + port + " http://localhost:" + port);
    });
})




