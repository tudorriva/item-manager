const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authController = require('../controllers/authController');

// Public routes that check for logged in status
router.get('/', authController.isLoggedIn, itemController.getAllItems);
router.get('/add', authController.isLoggedIn, (req, res) => res.render('addItem'));
router.get('/edit/:id', authController.isLoggedIn, (req, res) => res.render('editItem', { itemId: req.params.id }));

router.get('/api/:id', authController.protect, itemController.getItemByIdJson);

// Protected routes - require login
router.use(authController.protect);

// For image uploads, use the upload middleware before the controller method
router.post('/add', 
  itemController.uploadItemImages,
  itemController.resizeItemImages,
  itemController.addItem
);
router.post('/edit/:id', 
  itemController.uploadItemImages,
  itemController.resizeItemImages,
  itemController.updateItem
);
router.post('/delete/:id', itemController.deleteItem);

// My Items page - requires authentication
router.get('/my-items', authController.protect, itemController.getMyItems);

// RESTful API Routes (v1)
// These follow the standard REST conventions with appropriate HTTP verbs
router.route('/api/v1/items')
  .get(itemController.getAllItemsApi)
  .post(
    authController.protect,
    itemController.uploadItemImages,
    itemController.resizeItemImages,
    itemController.createItemApi
  );

router.route('/api/v1/items/:id')
  .get(itemController.getItemByIdApi)
  .patch(
    authController.protect,
    itemController.uploadItemImages, 
    itemController.resizeItemImages,
    itemController.updateItemApi
  )
  .delete(
    authController.protect,
    itemController.deleteItemApi
  );

module.exports = router;