const { askGPT } = require('../../utils/gpt');
const ttsHandler = require('./ttsHandler');
const imageHandler = require('./imageHandler');
const memoryHandler = require('./memoryHandler');
const { detectLanguage } = require('../../utils/languageDetector');
const { getOrCreateMemory, setBotName, addFact, updateSummary } = require('../../utils/memory');
const { addJob } = require('../../utils/scheduler');

async function handleMessage(sock, m) {
  if (!m.message || m.key.fromMe) return;

  const from = m.key.remoteJid;
  const isGroup = from.endsWith('@g.us');
  const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const isMentioned = mentions.includes(sock.user.id);
  const isReply =
    m.message?.extendedTextMessage?.contextInfo?.participant === sock.user.id;
  if (isGroup && !(isMentioned || isReply)) return;

  const text =
    m.message.conversation ||
    m.message.extendedTextMessage?.text ||
    m.message.imageMessage?.caption ||
    m.message.videoMessage?.caption ||
    '';
  if (!text) return;

  let prompt = text.replace(/@[0-9]+/g, '').trim();
  const lang = detectLanguage(prompt);
  const userId = isGroup ? m.key.participant : from;
  const userMem = await getOrCreateMemory(userId);

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

    const schedMatch = prompt.match(/send(?: me)? (.+?) (?:tomorrow )?at (\d{1,2})(?::(\d{2}))?\s?(am|pm)/i);
    if (schedMatch) {
      let hour = parseInt(schedMatch[2]);
      const minute = parseInt(schedMatch[3] || '0');
      const ampm = schedMatch[4].toLowerCase();
      if (ampm === 'pm' && hour < 12) hour += 12;
      if (ampm === 'am' && hour === 12) hour = 0;
      const date = new Date();
      if (/tomorrow/i.test(prompt)) date.setDate(date.getDate() + 1);
      date.setHours(hour, minute, 0, 0);
      await addJob(from, schedMatch[1], date);
      await sock.sendMessage(from, { text: `Got it ${m.pushName}! I'll send it at ${date.toLocaleString()}.` }, { quoted: m });
      return;
    } else if (/send.+tomorrow/i.test(prompt)) {
      await sock.sendMessage(from, { text: `Sure ${m.pushName}! Is 9am good for you?` }, { quoted: m });
      return;
    }

    if (/^voice:\s*/i.test(prompt)) {
      const topic = prompt.replace(/^voice:\s*/i, '').trim();
      const reply = await askGPT(topic, userMem);
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

    const reply = await askGPT(prompt, userMem);
    await sock.sendMessage(from, { text: reply }, { quoted: m });
    await memoryHandler.saveInteraction(from, m, reply);
    await updateSummary(userId);
  } catch (err) {
    console.error('[MSG ERR]', err);
    await sock.sendMessage(from, { text: '⚠️ Something went wrong.' }, { quoted: m });
  }
}

module.exports = { handleMessage };
