const UserMemory = require('../models/UserMemory');
const { getRecentMessages, Memory } = require('../bot/handlers/memoryHandler');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getOrCreateMemory(userId) {
  let record = await UserMemory.findOne({ userId });
  if (!record) {
    record = await UserMemory.create({ userId, memory: {} });
  }
  record.lastInteraction = new Date();
  await record.save();
  return record;
}

async function setBotName(userId, name) {
  const mem = await getOrCreateMemory(userId);
  mem.name = name.trim();
  await mem.save();
}

async function addFact(userId, key, value = true) {
  const mem = await getOrCreateMemory(userId);
  mem.memory[key] = value;
  await mem.save();
}

async function updateSummary(userId) {
  const msgs = await getRecentMessages(userId, 200);
  if (!msgs.length) return;
  const convo = msgs
    .reverse()
    .map((m) => `User: ${m.text}\nBot: ${m.response}`)
    .join('\n');
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Summarize the conversation in a few sentences.' },
        { role: 'user', content: convo },
      ],
    });
    const summary = completion.choices[0].message.content.trim();
    const mem = await getOrCreateMemory(userId);
    mem.summary = summary;
    await mem.save();
  } catch (err) {
    console.error('[SUMMARY]', err.message);
  }
}

module.exports = { getOrCreateMemory, setBotName, addFact, updateSummary };
