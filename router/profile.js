const express = require('express');
const router = express.Router();
const User = require('../model/user.model');
const { userAuth } = require('../common/auth');
const upload = require('../common/fileUpload');


router.post('/add-address', userAuth, upload.single('pic'), async (req, res) => {

    const { name, email, city, country, address, postcode, phone, state } = req.body;
    console.log(name, email, city, req.file)

    try {
        const Address = await User.findById(req.user.id);

        if (req.file) {

            Address.profile = `${req.protocol}://${req.get('host')}/${req.file.filename}`;
        }

        Address.billingDetails = { name, email, city, country, address, postcode, phone, state };

        await Address.save();

        console.log(Address)

        res.send(Address.billingDetails);

    } catch (error) {

        res.status({ success: false, message: error.message });

    }

});


router.get('/get-address', userAuth, async (req, res) => {
    try {
        const Address = await User.findById(req.user.id);

        if (Address.billingDetails) {

            return res.status(200).send({ success: true, data: Address.billingDetails });
        } else {
            res.send({ success: false })
        }

    } catch (error) {

        res.status(500).send({ success: false, error: error.message });
    }
});


router.put('/edit-address/:id', userAuth, async (req, res) => {
    const { name, email, city, country, address, postcode, phone, state } = req.body;
    const addressId = req.params.id;

    try {
        const user = await User.findById(req.user.id);

        // Find the billing detail with the provided ID
        const billingDetailIndex = user.billingDetails.findIndex(b => b._id.toString() === addressId.toString());
        if (billingDetailIndex === -1) {
            return res.status(404).json({ error: "Billing detail not found" });
        }

        // Update the properties of the billing detail
        user.billingDetails[billingDetailIndex].name = name;
        user.billingDetails[billingDetailIndex].email = email;
        user.billingDetails[billingDetailIndex].city = city;
        user.billingDetails[billingDetailIndex].country = country;
        user.billingDetails[billingDetailIndex].address = address;
        user.billingDetails[billingDetailIndex].postcode = postcode;
        user.billingDetails[billingDetailIndex].phone = phone;
        user.billingDetails[billingDetailIndex].state = state;

        await user.save();

        res.status(200).json({ message: "Address updated successfully", success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error", success: false });
    }
});



module.exports = router;