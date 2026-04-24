const express = require('express');
const userController = require('../controllers/authController');
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

//  signup
router.post("/register", userController.registerUser);
router.post("/verifyandsignup", userController.verifyAndSignup);

// login
router.post("/login", userController.loginUser);
router.post("/resend-otp", userController.resendOTP);

// resend otp
router.post("/resend-otp", userController.resendOTP);

// forgot password
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

//change password
router.put("/change-password", protect, userController.changePassword);

module.exports = router;