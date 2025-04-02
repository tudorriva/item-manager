const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const cartController = require('../controllers/cartController');

// All cart routes need authentication
router.use(authController.protect);

router.get('/', cartController.getCart);
router.get('/data', cartController.getCartJson);
router.post('/add', authController.protect, cartController.addItemToCart);
router.post('/update', cartController.updateCartItem);
router.delete('/remove/:itemId', cartController.removeFromCart);

module.exports = router;