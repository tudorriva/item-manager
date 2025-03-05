const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

router.get('/', itemController.getAllItems);
router.get('/add', (req, res) => res.render('addItem'));
router.post('/add', itemController.addItem);
router.get('/edit/:id', itemController.getItemById);
router.post('/edit/:id', itemController.updateItem);
router.post('/delete/:id', itemController.deleteItem);

module.exports = router;