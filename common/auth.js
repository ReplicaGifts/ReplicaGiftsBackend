const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
const Admin = require("../model/admin.model");

require("dotenv").config();


const userAuth = function (req, res, next) {
    const token = req.header("Authorization");

    if (!token) return res.status(401).json({ message: "Auth Error" });


    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.SECRET_KEY);

        // Check if the user exists in the user collection
        User.findById(decoded.user.id).then((user) => {
            if (user) {
                req.user = decoded.user;
                req.role = "user"; // Set role to user
                next(); // Continue to the next middleware or route handler
            } else {
                console.log(token);
                // Check if the user exists in the admin collection
                return res.status(401).json({ message: "Auth Error" });
            }
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}


const adminAuth = function (req, res, next) {
    const token = req.header("Authorization");


    if (!token) return res.status(401).json({ message: "Auth Error" });

    try {
        const decoded = jwt.verify(token.split(' ')[1], "randomString");

        // Check if the user exists in the user collection
        Admin.findById(decoded.user.id).then((user) => {
            if (user) {
                req.user = decoded.user;
                req.role = "admin"; // Set role to user
                next(); // Continue to the next middleware or route handler
            } else {
                // Check if the user exists in the admin collection
                return res.status(401).json({ message: "Auth Error" });
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}


module.exports = {
    userAuth, adminAuth
}