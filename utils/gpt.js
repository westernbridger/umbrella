const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function askGPT(prompt, memory = {}) {
  try {
    console.log('[GPT] prompt:', prompt);
    const system = [];
    if (memory.name || memory.summary) {
      let content = 'You are a helpful WhatsApp assistant.';
      if (memory.name) content += ` The user calls you ${memory.name}.`;
      if (memory.memory && Object.keys(memory.memory).length) {
        content += ` Known facts: ${Object.keys(memory.memory).join(', ')}.`;
      }
      if (memory.summary) content += ` Conversation summary: ${memory.summary}`;
      system.push({ role: 'system', content });
    }
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
