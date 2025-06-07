const { askGPT } = require('../../utils/gpt');
const ttsHandler = require('./ttsHandler');
const imageHandler = require('./imageHandler');
const memoryHandler = require('./memoryHandler');
const { detectLanguage } = require('../../utils/languageDetector');

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

  try {
    if (/^voice:\s*/i.test(prompt)) {
      const topic = prompt.replace(/^voice:\s*/i, '').trim();
      const reply = await askGPT(topic);
      await ttsHandler.sendTTS(sock, from, reply, m);
      await memoryHandler.saveInteraction(from, m, reply);
      return;
    }

    const imgMatch = prompt.match(/^(generate image:|draw:)\s*(.+)/i);
    if (imgMatch) {
      await imageHandler.sendImage(sock, from, imgMatch[2], m);
      await memoryHandler.saveInteraction(from, m, '[image]');
      return;
    }

    const reply = await askGPT(prompt);
    await sock.sendMessage(from, { text: reply }, { quoted: m });
    await memoryHandler.saveInteraction(from, m, reply);
  } catch (err) {
    console.error('[MSG ERR]', err);
    await sock.sendMessage(from, { text: '⚠️ Something went wrong.' }, { quoted: m });
  }
}

module.exports = { handleMessage };
