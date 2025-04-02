const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

// Create JWT token
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Send token to client
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Set cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    httpOnly: true
  };
  res.cookie('jwt', token, cookieOptions);

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
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password!'
      });
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    // If everything ok, create token and send to client
    const token = signToken(user._id);
    
    // Set cookie options with fallback for missing env variable
    // Fix for "option expires is invalid" error
    const cookieExpiresIn = process.env.JWT_COOKIE_EXPIRES_IN || '90'; // Default to 90 days
    const expiresInDays = parseInt(cookieExpiresIn, 10) || 90; // Ensure it's a valid number
    
    const cookieOptions = {
      expires: new Date(
        Date.now() + expiresInDays * 24 * 60 * 60 * 1000
      ),
      httpOnly: false, 
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    };
    
    // Send token as cookie
    res.cookie('jwt', token, cookieOptions);
    
    // Remove password from output
    user.password = undefined;
    
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    console.log('Auth headers:', req.headers.authorization); // Add this debug line
    
    // 1) Getting token and check if it exists
    let token;
    if (
      req.headers.authorization && 
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
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
    res.locals.user = currentUser; // Make user accessible in templates
    next();
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

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    // 1) Get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that email address'
      });
    }

    // 2) Generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
      });
    } catch (err) {
      // If error sending email, reset the token and expiration
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the email. Try again later.'
      });
    }
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired'
      });
    }

    // Update password and clear reset fields
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Save updates and run validators
    await user.save();

    // 3) Log the user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Check if user is logged in - doesn't block access
exports.isLoggedIn = async (req, res, next) => {
  try {
    // Skip token check for login and signup pages
    if (req.originalUrl === '/login' || req.originalUrl === '/signup') {
      return next();
    }

    // Check for token
    let token;
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // No token = not logged in
    if (!token) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    // Store user info for templates
    req.user = currentUser;
    res.locals.user = currentUser;
    
    return next();
  } catch (err) {
    // Just proceed without authentication
    return next();
  }
};

// Get current user from protect middleware
exports.getCurrentUser = async (req, res) => {
  // The user is already available from the protect middleware
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
};

// Logout user
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({ status: 'success' });
};