const Item = require('../models/itemModel');

// Get all items
exports.getAllItems = async (req, res) => {
    try {
        const items = await Item.find();
        res.render('index', { items });
    } catch (err) {
        res.status(500).send(err);
    }
};

// Add a new item
exports.addItem = async (req, res) => {
    console.log('Request body:', req.body);
    const newItem = new Item(req.body);
    try {
        const savedItem = await newItem.save();
        console.log('New item added:', savedItem);
        res.status(200).json({ message: 'Item added successfully', item: savedItem });
    } catch (err) {
        console.error('Error saving item:', err);
        res.status(400).json(err);
    }
};

// Get an item by ID
exports.getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        res.render('editItem', { item });
    } catch (err) {
        res.status(500).send(err);
    }
};