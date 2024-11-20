const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');  // Import auth routes

dotenv.config();  // Load environment variables

const app = express();
app.use(express.json());  // Parse incoming JSON requests

// Use the authentication routes with /api/auth prefix
app.use('/api/auth', authRoutes);  // All auth routes will now be prefixed with /api/auth

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
