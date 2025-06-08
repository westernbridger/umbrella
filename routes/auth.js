const express = require('express');
const jwt = require('jsonwebtoken');
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
    const { email, password, displayName, avatarUrl } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    const user = await User.create({ email, password, displayName, avatarUrl });
    const token = generateToken(user);
    const userData = user.toObject();
    delete userData.password;
    res.status(201).json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    const userData = user.toObject();
    delete userData.password;
    res.json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
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
