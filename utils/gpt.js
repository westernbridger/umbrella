const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function askGPT(prompt, memory = {}, userName) {
  try {
    console.log('[GPT] prompt:', prompt);
    const system = [];
    let content =
      'You are Zaphar, a friendly, helpful and slightly humorous AI assistant for WhatsApp.';
    if (memory.name) content += ` The user calls you ${memory.name}.`;
    if (memory.memory && Object.keys(memory.memory).length) {
      content += ` Known facts: ${Object.keys(memory.memory).join(', ')}.`;
    }
    if (memory.summary) content += ` Conversation summary: ${memory.summary}`;
    if (userName) content += ` The user you are talking to is named ${userName}. Include their name in your replies when appropriate.`;
    system.push({ role: 'system', content });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [...system, { role: 'user', content: prompt }],
    });
    const reply = completion.choices[0].message.content.trim();
    console.log('[GPT] reply received');
    return reply;
  } catch (err) {
    console.error('[GPT] error:', err);
    throw err;
  }
}

module.exports = { askGPT };
