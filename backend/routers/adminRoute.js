const express = require('express');
const router = express.Router();

const adminController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/isAdmin");
const upload = require('../middleware/multerConfig');

router.get("/dashboard", protect, isAdmin, adminController.getAllUsers);

router.put("/update/:id", protect, isAdmin, upload.single('profilePic'), adminController.updateUserProfile);

router.delete("/delete-user/:id", protect, isAdmin, adminController.deleteUser);

module.exports = router;
