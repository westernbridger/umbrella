const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  chatId: String,
  userId: String,
  text: String,
  response: String,
  timestamp: { type: Date, default: Date.now },
});

const Memory = mongoose.model('Memory', memorySchema);

async function saveInteraction(chatId, m, response) {
  const text =
    m.message.conversation ||
    m.message.extendedTextMessage?.text ||
    m.message.imageMessage?.caption ||
    m.message.videoMessage?.caption ||
    '';
  await Memory.create({ chatId, userId: m.key.participant || m.key.remoteJid, text, response });
}

module.exports = { saveInteraction };
