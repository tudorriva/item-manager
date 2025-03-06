const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    }
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

const User = mongoose.model('User', userSchema);
module.exports = User;
