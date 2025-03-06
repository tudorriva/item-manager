const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Create JWT token
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Send token to client
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Signup
exports.signup = async (req, res) => {
  try {
    // Check if this is the first user or if no admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    // Only allow setting admin role if no admin exists yet
    const role = !adminExists && req.body.role === 'admin' 
      ? 'admin' 
      : 'user'; // Default to regular user

    // Create user
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: role // Use the role determined above
    });

    // Send token
    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    // Send token
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it exists
    let token;
    if (
      req.headers.authorization && 
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified, decoded:', decoded);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4) Grant access to protected route
    req.user = currentUser;
    console.log('Auth successful, proceeding to next middleware');
    console.log('User attached to request:', req.user._id);
    
    // Add debugging to see if user info is lost after this middleware
    next();
    console.log('After next() - req.user still exists:', !!req.user);
  } catch (err) {
    return res.status(401).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'user']
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    // Only admins can create other admins
    const newAdmin = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: 'admin'
    });

    // Remove password from output
    newAdmin.password = undefined;

    res.status(201).json({
      status: 'success',
      data: {
        user: newAdmin
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};