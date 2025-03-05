const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authController.protect, authController.getMe);

module.exports = router;