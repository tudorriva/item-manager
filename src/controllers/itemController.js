const Item = require('../models/itemModel');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Use disk storage instead of memory storage
const multerStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Path must be relative to your project root, not src directory
    const dir = path.join(__dirname, '../../public/img/items');
    
    // Log the directory for debugging
    console.log('Uploading to directory:', dir);
    
    // Ensure the directory exists
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    const ext = file.mimetype.split('/')[1];
    const filename = `item-${req.user.id}-${Date.now()}.${ext}`;
    
    // Log the filename for debugging
    console.log('Generated filename:', filename);
    
    cb(null, filename);
  }
});

// Filter to ensure only images are uploaded
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

// Middleware for uploading item images
exports.uploadItemImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 } // Optional additional images
]);

// Simplified version that doesn't use Sharp
exports.resizeItemImages = (req, res, next) => {
  if (!req.files) return next();
  
  console.log('Files received:', req.files);
  
  // 1) Process cover image
  if (req.files.imageCover) {
    // Get just the filename without the full path
    const file = req.files.imageCover[0];
    const fullPath = file.path;
    
    // Extract just the filename (remove the path prefix)
    const filename = path.basename(fullPath);
    
    console.log('Cover image filename:', filename);
    
    req.body.imageCover = filename;
  }

  // 2) Process additional images
  if (req.files.images) {
    req.body.images = req.files.images.map(file => {
      return path.basename(file.path);
    });
    
    console.log('Additional images:', req.body.images);
  }
  
  next();
};

// Get all items for home page
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.render('index', { 
      title: 'All Items', 
      items: items
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Error loading items' });
  }
};

// Add a new item
exports.addItem = async (req, res) => {
  try {
    // Create new item with the current user as owner
    const newItem = new Item({
      ...req.body,
      owner: req.user.id
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
        item: item
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get all items API
exports.getAllItemsApi = async (req, res) => {
  try {
    const items = await Item.find();
    
    res.status(200).json({
      status: 'success',
      results: items.length,
      data: {
        items: items
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get an item by ID API
exports.getItemByIdApi = async (req, res) => {
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
        item: item
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Create an item API
exports.createItemApi = async (req, res) => {
  try {
    const newItem = new Item({
      ...req.body,
      owner: req.user.id
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

// Update an item API
exports.updateItemApi = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        status: 'fail',
        message: 'No item found with that ID'
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

// Delete item API
exports.deleteItemApi = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    // Check if item exists
    if (!item) {
      return res.status(404).json({
        status: 'fail',
        message: 'No item found with that ID'
      });
    }
    
    // Check if user has permission to delete this item
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

// Get items for the logged-in user
exports.getMyItems = async (req, res) => {
  try {
    let items;
    let query = {};
    
    // If user is not admin, only show their own items
    if (req.user.role !== 'admin') {
      query.owner = req.user.id;
    } else {
      // For admins, populate the owner field to show user information
      items = await Item.find().populate({
        path: 'owner',
        select: 'name email'
      });
      
      return res.render('myItems', {
        title: 'All Items',
        items: items,
        isAdmin: true
      });
    }
    
    // For regular users
    items = await Item.find(query);
    
    res.render('myItems', {
      title: 'My Items',
      items: items,
      isAdmin: false
    });
  } catch (err) {
    console.error('Error fetching my items:', err);
    res.status(500).render('error', {
      message: 'Error loading items. Please try again.'
    });
  }
};