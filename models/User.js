const mongoose = require('mongoose');

// Define the User schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,  // Ensure usernames are unique
  },
  password: {
    type: String,
    required: true,
  },
  // You can add additional fields as needed, such as:
  email: {
    type: String,
    required: false,
    unique: true,  // If you want unique email addresses
  },
});

// Create the User model based on the schema
const User = mongoose.model('User', UserSchema);

module.exports = User;  // Export the model so it can be used elsewhere in your app
