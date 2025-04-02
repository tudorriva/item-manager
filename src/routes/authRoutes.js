const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Protected routes
router.use(authController.protect);
router.get('/me', authController.getMe);

// Auth check endpoint
router.get('/check', authController.protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
});

// Admin only routes
router.use(authController.restrictTo('admin'));
router.post('/create-admin', authController.createAdmin);

module.exports = router;