const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../model/user.model");
const { userAuth } = require("../common/auth");
const upload = require("../common/fileUpload");
require('dotenv').config();


router.post(
    "/signup",
    upload.single('avatar'),
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

            let profile = '';
            if (req.file) {

                profile = await uploadAndGetFirebaseUrl(req);
            }

            user = new User({
                username,
                email,
                password,
                profile
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
                process.env.SECRET_KEY,
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
                process.env.SECRET_KEY,
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






router.get("/me", userAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }
    catch (e) {
        res.status(500).send({ message: e.message });
    }
});



router.post('/edit-username', userAuth, async (req, res) => {

    const userId = req.user.id;
    const username = req.body.username;

    if (!username) {
        req.status(404).send({ success: false, message: "username is required" });
    }

    try {

        const user = await User.findById(userId).select('-password');

        user.username = username;

        await user.save();

        res.status(200).send({ success: true, message: "user name updated successfully", user: user });


    } catch (error) {
        res.status(500).send({ success: false, message: "Couldn't save profile", error: error.message });

    }


});




module.exports = router;