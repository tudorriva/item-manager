const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authController = require('../controllers/authController');

// Public routes
router.get('/', itemController.getAllItems);
router.get('/add', (req, res) => res.render('addItem'));
router.get('/edit/:id', (req, res) => res.render('editItem', { itemId: req.params.id }));

router.get('/api/:id', authController.protect, itemController.getItemByIdJson);

// Protected routes - require login
router.use(authController.protect);
router.post('/add', itemController.addItem);
router.post('/edit/:id', itemController.updateItem);
router.post('/delete/:id', itemController.deleteItem);

module.exports = router;