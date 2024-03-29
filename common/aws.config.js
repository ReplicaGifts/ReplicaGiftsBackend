const AWS = require('aws-sdk');

// Initialize AWS SDK with default configuration
AWS.config.update({
    region: 'your-region', // Specify your AWS region
});

// Optionally, if you haven't set up credentials through environment variables or a shared credentials file:
AWS.config.credentials = new AWS.Credentials({
    accessKeyId: 'your-access-key-id',
    secretAccessKey: 'your-secret-access-key'
});


const s3 = new AWS.S3();

// Function to upload file to AWS S3 and return the link
async function uploadToS3(file) {
    const params = {
        Bucket: 'your-bucket-name',
        Key: file.originalname, // You may want to generate a unique key here
        Body: file.buffer
    };

    const uploadedObject = await s3.upload(params).promise();
    return uploadedObject.Location; // Return the URL of the uploaded object
}



// Export the AWS S3 instance
module.exports = {
    s3, uploadToS3
}
