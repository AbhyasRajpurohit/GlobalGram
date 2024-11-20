// Importing necessary modules
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming this is the User model
const dotenv = require('dotenv');
const authMiddleware = require('../middlewares/authMiddleware'); // Protect routes with middleware

dotenv.config();

const router = express.Router();

/**
 * User registration (signup) route
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Validate required fields
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({ email, username, password: hashedPassword });
    await newUser.save();

    // Create a JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    // Send response with token
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * User login route
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    // Send response with token
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Protected route: /profile
 * GET /api/auth/profile
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password'); // Exclude the password field
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User profile retrieved successfully', user });
  } catch (error) {
    console.error('Profile error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Protected route: /update
 * PUT /api/auth/update
 */
router.put('/update', authMiddleware, async (req, res) => {
  const { userId } = req.user;  // From JWT payload
  const { username, email, password } = req.body;

  if (!username && !email && !password) {
    return res.status(400).json({ message: 'No data to update' });
  }

  try {
    let updatedFields = {};
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedFields.password = hashedPassword;
    }
    if (username) updatedFields.username = username;
    if (email) updatedFields.email = email;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true }
    ).select('-password'); // Exclude the password field

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User updated successfully',
      updatedUser: {
        username: updatedUser.username,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error('Update error:', error.message);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

module.exports = router; // Export the router
