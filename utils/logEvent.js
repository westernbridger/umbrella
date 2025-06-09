const Activity = require('../models/Activity');

async function logEvent(type, userId, message, context = {}) {
  const event = await Activity.create({ type, user: userId, message, context });
  return event;
}

module.exports = { logEvent };
