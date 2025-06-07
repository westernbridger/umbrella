const mongoose = require('mongoose');

const scheduledMessageSchema = new mongoose.Schema({
  chatId: String,
  message: String,
  scheduledTime: Date,
  sent: { type: Boolean, default: false },
});

module.exports = mongoose.model('ScheduledMessage', scheduledMessageSchema);
