const { askGPT } = require('../../utils/gpt');
const memoryHandler = require('./memoryHandler');
const { getOrCreateMemory, setBotName, addFact, updateSummary } = require('../../utils/memory');
const { addJob } = require('../../utils/scheduler');
const chrono = require('chrono-node');

/**
 * Handle an incoming message from @open-wa/wa-automate.
 * @param {*} client The wa-automate client
 * @param {*} message The incoming message
 * @param {string} botId The bot's jid (e.g. 12345@c.us)
 * @param {string} defaultName The default name of the bot
 */
async function handleOpenWaMessage(client, message, botId, defaultName = 'zaphar') {
  const text = message.body || message.caption || '';
  if (!text || message.fromMe) return;

  const from = message.chatId;
  const isGroup = message.isGroupMsg;
  const userId = isGroup ? message.sender.id : from;
  const userMem = await getOrCreateMemory(userId);
  const botName = (userMem.name || defaultName).toLowerCase();

  const mentionByJid = (message.mentionedJidList || []).includes(botId);
  const mentionByName = new RegExp(`@${botName}\\b`, 'i').test(text);
  const isReplyToBot = message.quotedMsg && message.quotedMsg.fromMe;

  const shouldReply = !isGroup || mentionByJid || isReplyToBot || mentionByName;
  if (!shouldReply) return;

  console.log('[MSG]', { from, isGroup, mentionByJid, mentionByName, isReplyToBot });

  let prompt = text.replace(/@[0-9]+/g, '').replace(new RegExp(`@${botName}\\b`, 'ig'), '').trim();

  const nameSet = prompt.match(/your name is now\s+(.+)/i);
  if (nameSet) {
    await setBotName(userId, nameSet[1]);
    await client.reply(from, `Okay, I'll go by ${nameSet[1].trim()} now!`, message.id);
    return;
  }

  if (/podcast/i.test(prompt)) {
    await addFact(userId, 'podcast', true);
  }

  if (/(send|remind)/i.test(prompt)) {
    const parsed = chrono.parse(prompt, new Date(), { forwardDate: true });
    if (parsed.length) {
      const { start, text: timeText } = parsed[0];
      const date = start.date();
      let msg = prompt
        .replace(timeText, '')
        .replace(/^(send|remind)( me)?( to)?/i, '')
        .trim();
      await addJob(from, msg, date);
      await client.reply(from, `Got it! I'll remind you at ${date.toLocaleString()} to: ${msg}`, message.id);
      return;
    }
  }

  try {
    const reply = await askGPT(prompt, userMem, message.sender.pushname);
    await client.reply(from, reply, message.id);
    await memoryHandler.saveInteraction(from, message, reply);
    await updateSummary(userId);
  } catch (err) {
    console.error('[MSG ERR]', err);
    await client.reply(from, '⚠️ Something went wrong.', message.id);
  }
}

module.exports = { handleOpenWaMessage };
