const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authController = require('../controllers/authController');

// Public routes
router.get('/', itemController.getAllItems);

// Protected routes - require login
router.use(authController.protect);

// Routes for any logged-in user
router.get('/add', (req, res) => res.render('addItem'));
router.post('/add', itemController.addItem);
router.get('/edit/:id', itemController.getItemById);
router.post('/edit/:id', itemController.updateItem);
router.post('/delete/:id', itemController.deleteItem);

// Admin-only routes
router.use(authController.restrictTo('admin'));
router.get('/admin/all', itemController.getAllItems); // Example admin-only route

module.exports = router;