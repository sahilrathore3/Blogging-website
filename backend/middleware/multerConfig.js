const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        if (req.originalUrl.includes('blog')) {
            cb(null, 'uploads/blogs/');
        } else {
            cb(null, 'uploads/profiles/');
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e15);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },

    fileFilter: (req, file, cb) => {

        const filetypes = /jpeg|jpg|png/;

        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Error: Only .jpeg, .jpg, and .png images under 5MB are allowed!'), false);
        }
    }
});

module.exports = upload;