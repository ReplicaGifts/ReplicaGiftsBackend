const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: './uploads/', // Specify the upload directory
    filename: function (req, file, callback) {
        callback(null, file.fieldname + "-" + Math.floor(Math.random() * 999999) + Date.now() + "-" + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


module.exports = upload;



// const multer = require('multer');

// // Configure Multer for file upload
// const upload = multer({
//     dest: './public/uploads/',
//     limits: { fileSize: 100000 },
// })

// module.exports = upload;
