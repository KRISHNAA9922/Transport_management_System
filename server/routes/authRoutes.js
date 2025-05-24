const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register (Admin creates users)
router.post('/register', async (req, res) => {
  const { name, email, password, role, mobile } = req.body;

  try {
    // Server-side validation for mobile if role is driver
    if (role === 'driver' && (!mobile || mobile.trim().length !== 10)) {
      return res.status(400).json({ message: 'Mobile number is required and must be 10 digits for drivers' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ name, email, password, role, mobile });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({ token, user: { id: user._id, name, email, role } });
  } catch (error) {
    console.error('Register error message:', error.message);
    console.error('Register error stack:', error.stack);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all drivers (Authenticated users only)
router.get('/drivers', authMiddleware(), async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('name email _id');
    res.json(drivers);
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
