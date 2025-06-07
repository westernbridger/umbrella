const cron = require('node-cron');
const tasks = new Map();

function scheduleMessage(id, cronTime, job) {
  if (tasks.has(id)) tasks.get(id).stop();
  const task = cron.schedule(cronTime, job, { timezone: 'UTC' });
  tasks.set(id, task);
}

module.exports = { scheduleMessage };
