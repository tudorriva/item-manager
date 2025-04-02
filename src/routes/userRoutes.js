const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authentication routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Protected routes - require login
router.use(authController.protect); // Apply protect middleware to all routes below
router.get('/me', authController.getCurrentUser);

module.exports = router;