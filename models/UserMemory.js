const mongoose = require('mongoose');

const userMemorySchema = new mongoose.Schema({
  userId: String, // WhatsApp JID
  name: String, // User-given name for the bot
  memory: { type: mongoose.Schema.Types.Mixed, default: {} }, // Key facts
  lastInteraction: { type: Date, default: Date.now },
  summary: String, // Summary of past messages
});

module.exports = mongoose.model('UserMemory', userMemorySchema);
