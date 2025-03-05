const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const itemRoutes = require('./routes/itemRoutes');

console.log('Starting application...');

// Check if .env file exists
const envFilePath = path.join(__dirname, '../.env');
console.log('.env file path:', envFilePath);
console.log('.env file exists:', fs.existsSync(envFilePath));

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();

// Use ejs-mate for layout support
app.engine('ejs', require('ejs-mate'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Setup routes
app.use('/items', itemRoutes);
app.get('/', (req, res) => res.redirect('/items'));

// Log environment variables
console.log('Environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGODB_URI:', process.env.MONGODB_URI || 'Not set');

// Add unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// MongoDB connection and server start
const startServer = async () => {
  console.log('Attempting to connect to MongoDB...');
  
  try {
    // Default to localhost if no URI is provided
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/my-crud-app';
    console.log('Using MongoDB URI:', uri);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB successfully');
    
    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('✗ Failed to connect to MongoDB:', err);
    // Keep the process alive to see the logs
    console.log('Process will exit in 5 seconds...');
    setTimeout(() => process.exit(1), 5000);
  }
};

// Start the server
console.log('Calling startServer()...');
startServer().catch(err => {
  console.error('Startup error:', err);
  setTimeout(() => process.exit(1), 5000);
});