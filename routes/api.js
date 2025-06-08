const express = require('express');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const Bot = require('../models/Bot');
const ScheduledMessage = require('../models/ScheduledMessage');
const router = express.Router();

// API routes providing bot statistics and actions.
// These return stub data for now; integrate with the WhatsApp bot to
// supply real metrics when available.

// TODO: Replace stub data with real bot metrics
router.get('/ping', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/status', auth, (req, res) => {
  res.json({ online: true });
});

router.get('/stats/messages', auth, async (req, res) => {
  const bots = await Bot.find({ owner: req.user._id });
  const count = bots.reduce((n, b) => n + (b.messages?.length || 0), 0);
  res.json({ count });
});

router.get('/stats/active-users', auth, async (req, res) => {
  const bots = await Bot.find({ owner: req.user._id });
  const contacts = new Set();
  bots.forEach(b => b.contacts.forEach(c => contacts.add(c.phoneNumber)));
  res.json({ count: contacts.size });
});

// Example protected route
router.get('/protected', auth, (req, res) => {
  res.json({ message: `Hello ${req.user.displayName || req.user.email}` });
});

router.get('/activity/recent', auth, async (req, res) => {
  const bots = await Bot.find({ owner: req.user._id });
  let messages = [];
  bots.forEach(b => {
    if (Array.isArray(b.messages)) {
      messages = messages.concat(b.messages);
    }
  });
  messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(messages.slice(0, 10));
});

router.post('/bot/restart', auth, isAdmin, (req, res) => {
  console.log('Bot restart requested');
  // TODO: hook into actual bot restart logic
  res.json({ ok: true });
});

router.get('/scheduler/tasks', auth, async (req, res) => {
  const tasks = await ScheduledMessage.find({ sent: false });
  res.json(tasks);
});

module.exports = router;

