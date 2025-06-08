const express = require('express');
const Bot = require('../models/Bot');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all bots for the authenticated user
router.get('/', auth, async (req, res) => {
  const bots = await Bot.find({ owner: req.user._id });
  res.json(bots);
});

// Create new bot
router.post('/', auth, async (req, res) => {
  try {
    const bot = await Bot.create({ ...req.body, owner: req.user._id });
    res.status(201).json(bot);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create bot' });
  }
});

// Get a single bot
router.get('/:id', auth, async (req, res) => {
  const bot = await Bot.findOne({ _id: req.params.id, owner: req.user._id });
  if (!bot) return res.status(404).json({ message: 'Bot not found' });
  res.json(bot);
});

// Update a bot
router.put('/:id', auth, async (req, res) => {
  try {
    const bot = await Bot.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!bot) return res.status(404).json({ message: 'Bot not found' });
    res.json(bot);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to update bot' });
  }
});

// Delete a bot
router.delete('/:id', auth, async (req, res) => {
  const bot = await Bot.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!bot) return res.status(404).json({ message: 'Bot not found' });
  res.json({ success: true });
});

module.exports = router;
