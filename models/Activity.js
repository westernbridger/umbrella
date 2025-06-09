const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  context: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
