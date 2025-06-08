const express = require('express');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// TODO: add email verification and password reset routes

function generateToken(user) {
  const payload = { id: user._id };
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  return token;
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ success: false, message: 'Name, email and password are required' });
    }
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid email format' });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: 'That email is already in use' });
    }

    const user = await User.create({ email, password, displayName: name });
    const userData = {
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };
    res
      .status(201)
      .json({ success: true, message: 'User registered successfully', user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const bcrypt = require('bcrypt');
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    const token = generateToken(user);
    const { email: userEmail, displayName, role } = user;
    res.json({ success: true, token, user: { email: userEmail, displayName, role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  // For stateless JWT, logout is handled client-side
  // TODO: Implement token blacklist for proper logout if needed
  res.json({ message: 'Logged out' });
});

router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

// Additional routes can be added here, e.g. password reset

module.exports = router;
