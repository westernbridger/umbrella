const { askGPT } = require('../../utils/gpt');
const ttsHandler = require('./ttsHandler');
const imageHandler = require('./imageHandler');
const memoryHandler = require('./memoryHandler');
const { detectLanguage } = require('../../utils/languageDetector');
const { getOrCreateMemory, setBotName, addFact, updateSummary } = require('../../utils/memory');
const { addJob } = require('../../utils/scheduler');
const chrono = require('chrono-node');

async function handleMessage(sock, m) {
  if (!m.message || m.key.fromMe) return;

  const from = m.key.remoteJid;
  const isGroup = from.endsWith('@g.us');
  const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const isMentioned = mentions.includes(sock.user.id);
  const quoted = m.message?.extendedTextMessage?.contextInfo;
  const isReply = quoted?.participant === sock.user.id;

  const text =
    m.message.conversation ||
    m.message.extendedTextMessage?.text ||
    m.message.imageMessage?.caption ||
    m.message.videoMessage?.caption ||
    '';
  if (!text) return;

  const userId = isGroup ? m.key.participant : from;
  const userMem = await getOrCreateMemory(userId);
  const botName = userMem.name ? userMem.name.toLowerCase() : null;
  const mentionByName = botName ? new RegExp(`@${botName}\\b`, 'i').test(text) : false;
  let quotedText = '';
  if (quoted?.quotedMessage) {
    quotedText =
      quoted.quotedMessage.conversation ||
      quoted.quotedMessage.extendedTextMessage?.text ||
      '';
  }
  const quotedMentions =
    quoted?.quotedMessage?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const mentionInQuote = quotedMentions.includes(sock.user.id) ||
    (botName ? new RegExp(`@${botName}\\b`, 'i').test(quotedText) : false);

  if (isGroup && !(isMentioned || mentionByName || isReply || mentionInQuote)) return;

  let prompt = text.replace(/@[0-9]+/g, '').trim();
  const lang = detectLanguage(prompt);

  try {
    const nameSet = prompt.match(/your name is now\s+(.+)/i);
    if (nameSet) {
      await setBotName(userId, nameSet[1]);
      await sock.sendMessage(from, { text: `Okay, I'll go by ${nameSet[1].trim()} now!` }, { quoted: m });
      return;
    }

    if (/podcast/i.test(prompt)) {
      await addFact(userId, 'podcast', true);
    }

    const schedIntent = /(send|remind)/i.test(prompt);
    if (schedIntent) {
      const parsed = chrono.parse(prompt, new Date(), { forwardDate: true });
      if (parsed.length) {
        const { start, text: timeText, index } = parsed[0];
        const date = start.date();
        const hasTime = start.knownValues.hour !== undefined;
        const msg = prompt.replace(timeText, '').trim();
        if (!hasTime) {
          await sock.sendMessage(from, { text: `Sure ${m.pushName}! Is 9am okay?` }, { quoted: m });
          return;
        }
        await addJob(from, msg.replace(/^(send|remind)\s*(me)?/i, '').trim(), date);
        await sock.sendMessage(from, { text: `Got it ${m.pushName}! I'll send it at ${date.toLocaleString()}.` }, { quoted: m });
        return;
      }
    }

    if (/^voice:\s*/i.test(prompt)) {
      const topic = prompt.replace(/^voice:\s*/i, '').trim();
      const reply = await askGPT(topic, userMem, m.pushName);
      await ttsHandler.sendTTS(sock, from, reply, m);
      await memoryHandler.saveInteraction(from, m, reply);
      await updateSummary(userId);
      return;
    }

    const imgMatch = prompt.match(/^(generate image:|draw:)\s*(.+)/i);
    if (imgMatch) {
      await imageHandler.sendImage(sock, from, imgMatch[2], m);
      await memoryHandler.saveInteraction(from, m, '[image]');
      await updateSummary(userId);
      return;
    }

    const reply = await askGPT(prompt, userMem, m.pushName);
    await sock.sendMessage(from, { text: reply }, { quoted: m });
    await memoryHandler.saveInteraction(from, m, reply);
    await updateSummary(userId);
  } catch (err) {
    console.error('[MSG ERR]', err);
    await sock.sendMessage(from, { text: '⚠️ Something went wrong.' }, { quoted: m });
  }
}

module.exports = { handleMessage };
