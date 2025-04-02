const Cart = require('../models/cartModel');
const Item = require('../models/itemModel');

// Get cart for current user
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.item',
        select: 'name description quantity imageCover'
      });
    
    if (!cart) {
      // Create empty cart if none exists
      cart = { 
        user: req.user.id,
        items: [] 
      };
    }
    
    res.render('cart', {
      title: 'Your Cart',
      cart
    });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).render('error', {
      message: 'Error loading your cart'
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    
    // Verify that item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        status: 'fail',
        message: 'No item found with that ID'
      });
    }
    
    // Check if quantity requested is available
    if (item.quantity < quantity) {
      return res.status(400).json({
        status: 'fail',
        message: 'Not enough items in stock'
      });
    }
    
    // Find cart or create new one
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: []
      });
    }
    
    // Check if item is already in cart
    const existingItemIndex = cart.items.findIndex(
      cartItem => cartItem.item.toString() === itemId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists in cart
      cart.items[existingItemIndex].quantity += parseInt(quantity, 10);
    } else {
      // Add new item to cart
      cart.items.push({
        item: itemId,
        quantity: parseInt(quantity, 10)
      });
    }
    
    await cart.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Add item to cart
exports.addItemToCart = async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    
    if (!itemId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Item ID is required'
      });
    }
    
    // Find the user's cart
    let cart = await Cart.findOne({ user: req.user.id });
    
    // Create a cart if it doesn't exist
    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: []
      });
    }
    
    // Check if item already exists in cart
    const itemIndex = cart.items.findIndex(item => item.item.toString() === itemId);
    
    if (itemIndex > -1) {
      // Item exists, update quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Item doesn't exist, add new item
      cart.items.push({
        item: itemId,
        quantity: quantity
      });
    }
    
    // Save updated cart
    await cart.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update item quantity in cart
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({
        status: 'fail',
        message: 'Quantity must be at least 1'
      });
    }
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'No cart found'
      });
    }
    
    const itemIndex = cart.items.findIndex(
      cartItem => cartItem.item.toString() === itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Item not found in cart'
      });
    }
    
    // Update quantity
    cart.items[itemIndex].quantity = parseInt(quantity, 10);
    await cart.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'No cart found'
      });
    }
    
    cart.items = cart.items.filter(item => item.item.toString() !== itemId);
    await cart.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get cart data as JSON
exports.getCartJson = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.item',
        select: 'name description quantity imageCover'
      });
    
    if (!cart) {
      cart = {
        user: req.user.id,
        items: []
      };
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};