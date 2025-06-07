const { askGPT } = require('../../utils/gpt');
const fs = require('fs');
const memoryHandler = require('./memoryHandler');
const { createVoiceFiles } = require('../../utils/tts');
const imageHandler = require('../../utils/image');
const {
  getOrCreateMemory,
  setBotName,
  addFact,
  updateSummary,
} = require('../../utils/memory');
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

  const rawMentionByJid = (message.mentionedJidList || []).includes(botId);
  const mentionByName = new RegExp(`@${botName}\\b`, 'i').test(text);
  const mentionByJid = rawMentionByJid || mentionByName;
  const isReplyToBot =
    (message.quotedMsg && message.quotedMsg.fromMe) ||
    (message.quotedMsgObj && message.quotedMsgObj.fromMe) ||
    message.quotedParticipant === botId;

  if (isGroup) {
    console.log('[DBG]', {
      groupId: from,
      text,
      mentionedJidList: message.mentionedJidList,
      botId,
      mentionByJid,
    });
  }

  const shouldReply = !isGroup || mentionByJid || isReplyToBot;
  if (!shouldReply) return;

  console.log('[MSG]', { from, isGroup, mentionByJid, isReplyToBot });

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
      const hasTime = start.knownValues.hour !== undefined;

      let msg = prompt
        .replace(timeText, '')
        .replace(/^(send|remind)( me)?( to)?/i, '')
        .trim();

      if (!hasTime) {
        await client.reply(from, `Sure ${message.sender.pushname}! Should I remind you at 9am?`, message.id);
        return;
      }

      await addJob(from, msg, date, userId);
      await client.reply(
        from,
        `Got it ${message.sender.pushname}, I'll remind you at ${date.toLocaleString()} to: ${msg}`,
        message.id
      );
      return;
    }
  }

  if (/^voice:\s*/i.test(prompt)) {
    const topic = prompt.replace(/^voice:\s*/i, '').trim();
    const reply = await askGPT(topic, userMem, message.sender.pushname);
    const files = await createVoiceFiles(reply);
    for (const file of files) {
      await client.sendPtt(from, file, message.id);
      fs.unlinkSync(file);
    }
    await memoryHandler.saveInteraction(from, message, reply);
    await updateSummary(userId);
    return;
  }

  const imgMatch = prompt.match(/^(generate image:|draw:)\s*(.+)/i);
  if (imgMatch) {
    try {
      const imgPath = await imageHandler.generateImage(imgMatch[2]);
      await client.sendImage(from, imgPath, 'image.jpg', '', message.id);
      fs.unlinkSync(imgPath);
      await memoryHandler.saveInteraction(from, message, '[image]');
      await updateSummary(userId);
    } catch (err) {
      console.error('[IMG]', err);
      await client.reply(from, 'Image generation failed.', message.id);
    }
    return;
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
