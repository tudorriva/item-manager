const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authController = require('../controllers/authController');

// Public routes
router.get('/', itemController.getAllItems);
router.get('/add', (req, res) => res.render('addItem'));
router.get('/edit/:id', itemController.getItemById);

// Protected routes
router.use(authController.protect); // All routes after this middleware are protected

router.post('/add', itemController.addItem);
router.post('/edit/:id', itemController.updateItem);
router.post('/delete/:id', itemController.deleteItem);

module.exports = router;