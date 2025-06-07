const express = require('express');
const router = express.Router();

// API routes providing bot statistics and actions.
// These return stub data for now; integrate with the WhatsApp bot to
// supply real metrics when available.

// TODO: Replace stub data with real bot metrics
router.get('/status', (req, res) => {
  res.json({ online: true, uptime: '12h 15m', activeGroups: 3 });
});

router.get('/messages/today', (req, res) => {
  res.json({ count: 128 });
});

router.get('/users/active', (req, res) => {
  res.json({ count: 24 });
});

router.get('/activity', (req, res) => {
  // Example array of 10 recent events
  const events = Array.from({ length: 10 }).map((_, idx) => ({
    type: 'message',
    user: `user${idx + 1}`,
    message: `Test message ${idx + 1}`,
    timestamp: Date.now() - idx * 60000,
  }));
  res.json(events);
});

router.post('/bot/restart', (req, res) => {
  console.log('Bot restart requested');
  // TODO: hook into actual bot restart logic
  res.json({ ok: true });
});

module.exports = router;

