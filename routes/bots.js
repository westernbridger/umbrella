const express = require('express');
const Bot = require('../models/Bot');
const auth = require('../middleware/auth');
const { exec } = require('child_process');
const { logEvent } = require('../utils/logEvent');

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

router.post('/:id/start', auth, async (req, res) => {
  const bot = await Bot.findOne({ _id: req.params.id, owner: req.user._id });
  if (!bot) return res.status(404).json({ message: 'Bot not found' });
  exec('pm2 start bot/openwa.js --name zaphar-bot', { windowsHide: true }, async (err) => {
    if (err) return res.status(500).json({ success: false });
    bot.status = 'online';
    await bot.save();
    const event = await logEvent('SERVER_EVENT', req.user._id, 'Bot started', { botId: bot._id });
    const io = req.app.get('io');
    if (io) {
      io.emit('botStatus', { id: bot._id, status: bot.status });
      io.emit('activity', event);
    }
    res.json({ success: true, status: bot.status });
  });
});

router.post('/:id/stop', auth, async (req, res) => {
  const bot = await Bot.findOne({ _id: req.params.id, owner: req.user._id });
  if (!bot) return res.status(404).json({ message: 'Bot not found' });
  exec('pm2 stop zaphar-bot', { windowsHide: true }, async (err) => {
    if (err) return res.status(500).json({ success: false });
    bot.status = 'paused';
    await bot.save();
    const event = await logEvent('SERVER_EVENT', req.user._id, 'Bot stopped', { botId: bot._id });
    const io = req.app.get('io');
    if (io) {
      io.emit('botStatus', { id: bot._id, status: bot.status });
      io.emit('activity', event);
    }
    res.json({ success: true, status: bot.status });
  });
});

router.post('/:id/restart', auth, async (req, res) => {
  const bot = await Bot.findOne({ _id: req.params.id, owner: req.user._id });
  if (!bot) return res.status(404).json({ message: 'Bot not found' });
  exec('pm2 restart zaphar-bot', { windowsHide: true }, async (err) => {
    if (err) return res.status(500).json({ success: false });
    bot.status = 'online';
    await bot.save();
    const event = await logEvent('SERVER_EVENT', req.user._id, 'Bot restarted', { botId: bot._id });
    const io = req.app.get('io');
    if (io) {
      io.emit('botStatus', { id: bot._id, status: bot.status });
      io.emit('activity', event);
    }
    res.json({ success: true, status: bot.status });
  });
});

module.exports = router;
