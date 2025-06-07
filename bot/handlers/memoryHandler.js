const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  chatId: String,
  userId: String,
  text: String,
  response: String,
  timestamp: { type: Date, default: Date.now },
});

const Memory = mongoose.model('Memory', memorySchema);

async function getRecentMessages(userId, limit = 200) {
  return Memory.find({ userId }).sort({ timestamp: -1 }).limit(limit).lean();
}

function extractText(m) {
  if (!m) return '';
  if (m.body) return m.body;
  if (m.text) return m.text;
  if (m.caption) return m.caption;
  if (m.message)
    return (
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      m.message.videoMessage?.caption ||
      ''
    );
  return '';
}

async function saveInteraction(chatId, m, response) {
  const text = extractText(m);
  const userId = m.sender?.id || m.key?.participant || m.key?.remoteJid;
  await Memory.create({ chatId, userId, text, response });
}

module.exports = { saveInteraction, getRecentMessages, Memory, extractText };
