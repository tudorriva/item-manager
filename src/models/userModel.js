const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Add this at the top

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8,
        select: false
    },

    role: {
        type: String,
        enum: ['user', 'admin', 'manager'],
        default: 'user'
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    passwordResetToken: String,
    passwordResetExpires: Date
});

// Hash password
userSchema.pre('save', async function(next) {
    // Only if password modified
    if(!this.isModified('password')) {
        next();
    }

    // Hash password with cost 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

// Generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Encrypt token for database storage
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Set expiration
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  console.log({ resetToken });
  console.log({ passwordResetToken: this.passwordResetToken });
  
  // Return unencrypted token (for email)
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
