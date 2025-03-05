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
        if (!item) {
            return res.status(404).send('Item not found');
        }
        res.render('editItem', { item });
    } catch (err) {
        res.status(500).send(err);
    }
};

// Update an item
exports.updateItem = async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
    } catch (err) {
        res.status(400).json(err);
    }
};

// Delete an item
exports.deleteItem = async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(400).json(err);
    }
};