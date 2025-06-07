const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: String,
  firstName: String,
  language: { type: String, default: 'en' },
  tone: { type: String, default: 'friendly' },
});

const User = mongoose.model('User', userSchema);

async function getOrCreateUser(userId, firstName, language) {
  let user = await User.findOne({ userId });
  if (!user) {
    user = await User.create({ userId, firstName, language });
  }
  return user;
}

module.exports = { getOrCreateUser };
