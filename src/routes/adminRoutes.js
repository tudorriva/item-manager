const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

// Special route to render the admin page template without requiring authentication
router.get('/users', (req, res) => {
  res.render('admin/users', { 
    users: [],
    isLoading: true,
    title: 'Manage Users' 
  });
});

// API routes for data that require authentication
router.use('/api', authController.protect);
router.use('/api', authController.restrictTo('admin'));
router.get('/api/users', adminController.getUsersData);
router.get('/api/users/:id', adminController.getUserData);
router.post('/api/users/:id', adminController.updateUser);
router.delete('/api/users/:id', adminController.deleteUser);

module.exports = router;