const express = require('express');
const router = express.Router();

const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require('../middleware/multerConfig');

router.get("/profile", protect, userController.getMyProfile);
router.put("/update/:id", protect, upload.single("profilePic"), userController.updateUserProfile);

module.exports = router;
