const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../model/admin.model");

const Contact = require("../model/contact.model");
const { adminAuth } = require("../common/auth");

// const auth = require("../middelware/auth");
// const adminRole = require('../middelware/checkRole');



router.post(
    "/signup",
    [
        check("username", "Please Enter a Valid Username")
            .not()
            .isEmpty(),
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 6
        })
    ],

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { username, email, password } = req.body;


        try {
            let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({
                    msg: "User Already Exists"
                });
            }

            user = new User({
                username,
                email,
                password
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                "randomString",
                {
                    expiresIn: '30d'
                },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        token
                    });
                }
            );

        } catch (err) {
            console.log(err.message);
            res.status(500).send({ message: err.message });
        }
    }
);




router.post(
    "/login",

    [
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 6
        })
    ],

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        try {
            let user = await User.findOne({
                email
            });

            if (!user)
                return res.status(400).json({
                    message: "User Not Exist"
                });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch)
                return res.status(400).json({
                    message: "Incorrect Password !"
                });

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                "randomString",
                {
                    expiresIn: '30d'
                },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        token
                    });
                }
            );

        }

        catch (e) {
            console.error(e);
            res.status(500).send({ message: e.message });
        }
    }
);






router.get("/me", adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    }
    catch (e) {
        res.status(500).send({ message: e.message });
    }
});


router.post('/contact', async (req, res) => {


    const { name, email, subject, message, phone } = req.body;

    try {

        const contact = new Contact({
            name, email, subject, message, phone
        })


        contact.save();

        res.send({ success: true, message: 'contact successfully' });

    } catch (e) {
        res.status(500).send({ error: e.message, success });
    }
});


router.get('/contact', async (req, res) => {

    const page = req.query.page;
    const limit = req.query.limit;
    const status = req.query.status;

    const statusOptions = ['recent', 'viewed'];

    try {

        await Contact.updateMany({ notify: true });

        const filter = { isViewed: true };

        if (status.toLowerCase() === statusOptions[0]) {
            filter.isViewed = false;
        }

        const contact = await Contact.find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ chreatedAt: -1 });


        const count = await Contact.countDocuments(filter);

        res.send({ contact, count });

    } catch (e) {

        res.status(500).send({ success: false, error: e.message });
    }
});


router.get('/notify', async function (req, res) {
    try {
        const count = await Contact.countDocuments({ notify: false });
        res.json({ count });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post('/viewed/:id', adminAuth, async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, { $set: { isViewed: true } }, { new: true });

        res.send({ success: true, contact });
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: error, success: false });
    }
});

router.delete('/contact/:id', async function (req, res) {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);


        res.send({ success: true, message: 'deleted successfully' });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
})


module.exports = router;