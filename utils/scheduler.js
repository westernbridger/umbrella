const ScheduledMessage = require('../models/ScheduledMessage');

function startScheduler(sock) {
  setInterval(async () => {
    const now = new Date();
    const jobs = await ScheduledMessage.find({ sent: false, scheduledTime: { $lte: now } });
    for (const job of jobs) {
      try {
        await sock.sendMessage(job.userId, { text: job.message });
        job.sent = true;
        await job.save();
      } catch (err) {
        console.error('[SCHEDULER]', err.message);
      }
    }
  }, 60 * 1000);
}

async function addJob(userId, message, time) {
  return ScheduledMessage.create({ userId, message, scheduledTime: time, sent: false });
}

module.exports = { startScheduler, addJob };
