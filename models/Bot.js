const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
}, { _id: false });

const botSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  botName: { type: String, required: true },
  phoneNumber: String,
  whatsappId: String,
  status: { type: String, enum: ['online', 'paused', 'archived'], default: 'online' },
  personality: String,
  contacts: [contactSchema],
  conversations: { type: [mongoose.Schema.Types.Mixed], default: [] },
  messages: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Bot', botSchema);
