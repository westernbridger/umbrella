const ScheduledMessage = require('../models/ScheduledMessage');
const { askGPT } = require('./gpt');
const { getOrCreateMemory } = require('./memory');

/**
 * Start the scheduler which checks for pending messages every 10 seconds.
 * @param {(chatId: string, text: string) => Promise<any>} sendFn Function used to send a message.
 */
function startScheduler(sendFn) {
  setInterval(async () => {
    const now = new Date();
    const jobs = await ScheduledMessage.find({ sent: false, scheduledTime: { $lte: now } });
    if (jobs.length) console.log('[SCHEDULER]', 'Sending', jobs.length, 'queued messages');
    for (const job of jobs) {
      try {
        let text = job.message;
        if (job.prompt) {
          const mem = job.userId ? await getOrCreateMemory(job.userId) : {};
          text = await askGPT(job.prompt, mem);
        }
        await sendFn(job.chatId, text);
        job.sent = true;
        await job.save();
      } catch (err) {
        console.error('[SCHEDULER]', err.message);
      }
    }
  }, 10 * 1000);
}

async function addJob(chatId, prompt, time, userId) {
  return ScheduledMessage.create({ chatId, prompt, userId, message: prompt, scheduledTime: time, sent: false });
}

module.exports = { startScheduler, addJob };
