const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const itemController = require('../controllers/itemController');
const statsController = require('../controllers/statsController');

// Public pages (no authentication required)
router.get('/login', (req, res) => {
  // If already logged in, redirect to home
  if (res.locals.user) {
    return res.redirect('/');
  }
  res.render('login', { title: 'Login' });
});

router.get('/signup', (req, res) => {
  // If already logged in, redirect to home
  if (res.locals.user) {
    return res.redirect('/');
  }
  res.render('signUp', { title: 'Sign Up' });
});

router.get('/forgot-password', (req, res) => {
  res.render('forgotPassword', { title: 'Forgot Password' });
});

router.get('/reset-password/:token', (req, res) => {
  res.render('resetPassword', { title: 'Reset Password', token: req.params.token });
});

// Token testing page (for development)
router.get('/token-test', (req, res) => {
  res.render('tokenTest', { title: 'Test Authentication' });
});

// Home page (shows all items)
router.get('/', authController.isLoggedIn, (req, res) => {
  res.redirect('/items');
});

// Items routes that serve pages
router.get('/items', authController.isLoggedIn, itemController.getAllItems);
router.get('/items/add', authController.protect, (req, res) => {
  res.render('addItem', { title: 'Add New Item' });
});
router.get('/items/edit/:id', authController.protect, (req, res) => {
  res.render('editItem', { title: 'Edit Item', itemId: req.params.id });
});
router.get('/items/my-items', authController.protect, itemController.getMyItems);

// Cart view page
router.get('/cart', authController.protect, (req, res) => {
  res.redirect('/cart/');
});

// Admin pages (require admin role)
router.get('/admin', authController.protect, authController.restrictTo('admin'), (req, res) => {
  res.redirect('/admin/users');
});

router.get('/admin/users', authController.isLoggedIn, (req, res) => {
  // Base rendering, actual data loaded via AJAX
  res.render('admin/users', { 
    title: 'Manage Users',
    isLoading: true 
  });
});

router.get('/admin/users/:id', authController.isLoggedIn, (req, res) => {
  // Base rendering, actual data loaded via AJAX
  res.render('admin/editUser', { 
    title: 'Edit User',
    userId: req.params.id,
    isLoading: true 
  });
});

// Statistics pages - require admin role
router.get('/stats', 
  authController.protect, 
  authController.restrictTo('admin'), 
  statsController.getItemStats
);

// API version of the stats
router.get('/api/stats', 
  authController.protect, 
  authController.restrictTo('admin'), 
  statsController.getItemStats
);

router.get('/api/stats/users', 
  authController.protect, 
  authController.restrictTo('admin'), 
  statsController.getUserStats
);

// Error page
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Error', 
    message: 'Something went wrong!' 
  });
});

// 404 handler - must be last route
router.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Page Not Found', 
    message: 'The page you are looking for does not exist.' 
  });
});

module.exports = router;