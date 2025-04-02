const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  imageCover: {
    type: String, // Stores the path/URL to the image
    required: [true, 'An item must have a cover image']
  },
  images: [String]
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;