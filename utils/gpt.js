const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function askGPT(prompt) {
  try {
    console.log('[GPT] prompt:', prompt);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
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
