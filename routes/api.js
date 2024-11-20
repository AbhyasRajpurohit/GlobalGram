const express = require('express');
const bcrypt = require('bcryptjs'); // For password hashing
const User = require('../models/User'); // Import the User model

const router = express.Router();

// POST /api/register to register a new user
router.post('/register', async (req, res) => {
  console.log("Request received at /register");
  try {
    const { username, email, password } = req.body;
    console.log("Request body:", req.body);  // Log the incoming data

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists with this email");
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error("Error in /register route:", err);  // Log the actual error message
    res.status(500).json({ message: 'Error registering user', error: err.message || err }); // Return the error message
  }
});
