const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const itemRoutes = require('./routes/itemRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

console.log('Starting application...');

// Check if .env file exists
const envFilePath = path.join(__dirname, '../.env');
console.log('.env file path:', envFilePath);
console.log('.env file exists:', fs.existsSync(envFilePath));

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();

// Generate a server start timestamp
const SERVER_START_TIME = Date.now();
app.locals.startTime = SERVER_START_TIME;

// Add a route to check server timestamp
app.get('/api/server-status', (req, res) => {
  res.json({ startTime: app.locals.startTime });
});

// Use ejs-mate for layout support
app.engine('ejs', require('ejs-mate'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Setup routes
app.use('/items', itemRoutes);
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => res.redirect('/items'));
app.use('/admin', adminRoutes);

// Add these routes to serve the login/signup pages
app.get('/login', (req, res) => res.render('login'));
app.get('/signup', (req, res) => res.render('signup'));

// Add this route to serve the token test page
app.get('/token-test', (req, res) => res.render('tokenTest'));

// Add unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// MongoDB connection and server start
const startServer = async () => {
  console.log('Attempting to connect to MongoDB...');
  
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/my-crud-app';
    console.log('Using MongoDB URI:', uri);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');
    
    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
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