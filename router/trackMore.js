const router = require('express').Router();
require('dotenv').config();


const axios = require('axios');

router.post('/track', async (req, res) => {
    const { tracking_id } = req.body;

    try {
        const apiBaseUrl = 'https://api.trackingmore.com/v4/trackings/realtime';
        const apiVersion = 'v4';
        const timeout = 10000;
        const apiKey = process.env.TrackingApiKey;

        // Construct the request URL
        // const apiUrl = `${apiBaseUrl}/${apiVersion}/trackings/create`;

        // Define request headers

        const headers = {
            'Content-Type': 'application/json',
            'Tracking-Api-Key': apiKey
        };


        console.log(headers)
        // Construct the request body
        const requestBody = {
            tracking_number: "TEST1234123411",
            courier_code: "dhl" // Adjust this according to the carrier code expected by the API
        };

        // Make POST request to the external API
        const response = await axios.post(apiBaseUrl, requestBody, { headers, timeout });

        // Process the response from the external API
        console.log('API Response:', response.data);

        // Send response back to the client
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error:', error);

        // Send error response back to the client
        res.status(500).json({ error: 'An error occurred while calling the external API.' });
    }
});




module.exports = router