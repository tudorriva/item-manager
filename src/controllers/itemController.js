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
  try {
    // Create new item with the current user as owner
    const newItem = new Item({
      ...req.body,
      owner: req.user.id  // Set the owner to the current user
    });
    
    const savedItem = await newItem.save();
    res.status(201).json({
      status: 'success',
      data: {
        item: savedItem
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
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
    const item = await Item.findById(req.params.id);
    
    // Check if item exists
    if (!item) {
      return res.status(404).json({
        status: 'fail',
        message: 'No item found with that ID'
      });
    }
    
    // If user is not admin and not the owner, forbid access
    if (req.user.role !== 'admin' && item.owner && !item.owner.equals(req.user.id)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to modify this item'
      });
    }
    
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        item: updatedItem
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    console.log('Inside deleteItem controller');
    console.log('User from request:', req.user ? req.user._id : 'Not found');
    
    // Your existing code...
    
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        status: 'fail',
        message: 'No item found with that ID'
      });
    }

    // If user is not admin and not the owner, forbid access
    if (req.user.role !== 'admin' && item.owner && !item.owner.equals(req.user.id)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete this item'
      });
    }
    
    await Item.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getItemByIdJson = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        status: 'fail',
        message: 'No item found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        item
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};