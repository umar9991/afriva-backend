const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const { sendVerificationCode, verifyOtp } = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/signout', authController.signout);

router.patch('/sendVerificationCode', authController.sendVerificationCode);
router.post('/verify-otp', verifyOtp);

module.exports = router;