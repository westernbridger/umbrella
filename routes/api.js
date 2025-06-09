const express = require('express');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const Bot = require('../models/Bot');
const ScheduledMessage = require('../models/ScheduledMessage');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const logFile = path.join(__dirname, '../logs/pm2-actions.log');
const { logEvent } = require('../utils/logEvent');
const Activity = require('../models/Activity');

function logAction(user, action, error) {
  const line = `${new Date().toISOString()} ${user.email} ${action} ${error ? 'ERROR: ' + error : 'OK'}\n`;
  fs.appendFile(logFile, line, () => {});
}

// API routes providing bot statistics and actions.
// These return stub data for now; integrate with the WhatsApp bot to
// supply real metrics when available.

// TODO: Replace stub data with real bot metrics
router.get('/ping', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/status', auth, isAdmin, (req, res) => {
  exec('pm2 jlist', { windowsHide: true }, (err, stdout) => {
    if (err) return res.json({ status: 'error' });
    try {
      const list = JSON.parse(stdout);
      const proc = list.find(p => p.name === 'zaphar-bot');
      const status = proc ? proc.pm2_env.status : 'stopped';
      res.json({ status });
    } catch (e) {
      res.json({ status: 'error' });
    }
  });
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
  const events = await Activity.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('user', 'displayName email');
  res.json(events);
});

router.post('/bot/start', auth, isAdmin, async (req, res) => {
  exec('pm2 start bot/openwa.js --name zaphar-bot', { windowsHide: true }, async (err) => {
    if (err) return res.status(500).json({ success: false });
    const event = await logEvent('SERVER_EVENT', req.user._id, 'Bot started');
    const io = req.app.get('io');
    if (io) io.emit('activity', event);
    res.json({ success: true });
  });
});

router.post('/bot/stop', auth, isAdmin, async (req, res) => {
  exec('pm2 stop zaphar-bot', { windowsHide: true }, async (err) => {
    if (err) return res.status(500).json({ success: false });
    const event = await logEvent('SERVER_EVENT', req.user._id, 'Bot stopped');
    const io = req.app.get('io');
    if (io) io.emit('activity', event);
    res.json({ success: true });
  });
});

router.post('/bot/restart', auth, isAdmin, async (req, res) => {
  exec('pm2 restart zaphar-bot', { windowsHide: true }, async (err) => {
    if (err) return res.status(500).json({ success: false });
    const event = await logEvent('SERVER_EVENT', req.user._id, 'Bot restarted');
    const io = req.app.get('io');
    if (io) io.emit('activity', event);
    res.json({ success: true });
  });
});

router.get('/scheduler/tasks', auth, async (req, res) => {
  const tasks = await ScheduledMessage.find({ sent: false });
  res.json(tasks);
});

module.exports = router;

