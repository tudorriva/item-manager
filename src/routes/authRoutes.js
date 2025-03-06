const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.use(authController.protect);
router.get('/me', authController.getMe);

// Admin only routes
router.use(authController.restrictTo('admin'));
router.post('/create-admin', authController.createAdmin);

module.exports = router;