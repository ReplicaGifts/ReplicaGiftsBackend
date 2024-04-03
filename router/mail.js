const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
require('dotenv').config();
const User = require('../model/user.model');




const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.user,
        pass: process.env.pass
    }
});


const generateOTP = async (email) => {
    const OTP = Math.floor(1000 + Math.random() * 9000); // Generate OTP
    const user = await User.findByIdAndUpdate(email, { OTP, OTPCreatedAt: new Date() }, { new: true });
    return user.OTP;
};


router.post('/forgot-password', async (req, res) => {

    const email = req.body.email;

    try {
        const user = await User.findOne({ email });

        console.log(user)
        if (user) {
            const mailOptions = {
                from: 'recoverid166@gmail.com',
                to: email,
                subject: 'Sending Email using Node.js',
                html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email Content</title>
                </head>
                <body>
                    <p>That was easy!</p>
                    <p>Your OTP is: <strong style='color:red;'>${await generateOTP(user._id)}</strong>.</p>
                </body>
                </html>
            `
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    res.status(500).send({ error: error.message });
                } else {
                    console.log('Email sent: ' + info.response);
                    res.status(200).send({ success: true, message: info.response });
                }
            });
        } else {
            res.status(404).send({ message: 'user not found in record' })
        }

    } catch (e) {
        res.status(500).send({ err: e.message })
    }


});


router.post('/verify-otp', async (req, res) => {
    const email = req.body.email;
    const enteredOTP = req.body.otp;

    console.log(enteredOTP, email);

    try {
        const user = await User.findOne({ email });

        if (user && user.OTP === +enteredOTP) {
            // Check if the OTP is still valid (e.g., within a time window)
            const otpExpirationTime = new Date(user.OTPCreatedAt).getTime() + (5 * 60 * 1000); // Assuming OTP expires in 5 minutes
            const currentTime = new Date().getTime();

            console.log(otpExpirationTime, currentTime)

            if (currentTime <= otpExpirationTime) {
                // OTP is valid
                res.status(200).send({ success: true, message: 'OTP verified successfully.' });
            } else {

                // OTP has expired
                res.status(400).send({ error: 'OTP has expired. Please generate a new OTP.' });
            }
        } else {
            // Invalid OTP or user not found
            res.status(400).send({ error: 'Invalid OTP or user not found.' });
        }
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});


router.post('/verify-email', async (req, res) => {

    const email = req.body.email;

    const OTP = Math.floor(1000 + Math.random() * 9000); // Generate OTP

    try {

        const user = await User.findOne({ email });

        if (user) {
            return res.send({ success: false, message: 'User already exist, Please login. ' })
        }

        const mailOptions = {
            from: 'recoverid166@gmail.com',
            to: email,
            subject: 'Sending Email using Node.js',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email Content</title>
                </head>
                <body>
                    <h1>Verify your profile</h1>
                    <p>Your OTP is: <strong style='color:red;'>${OTP}</strong>.</p>
                </body>
                </html>
            `
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.status(500).send({ error: error.message });
            } else {
                console.log('Email sent: ' + info.response);
                res.status(200).send({ success: true, message: info.response, otp: OTP });
            }
        });

    } catch (e) {
        res.status(500).send({ err: e.message })
    }


})


module.exports = router;