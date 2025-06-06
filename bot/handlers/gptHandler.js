const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function handleGPT(prompt) {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
        });
        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error('OpenAI error:', error);
        return 'Sorry, I could not process that.';
    }
}

module.exports = { handleGPT };
