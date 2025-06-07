const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateImage(prompt) {
  try {
    console.log('[DALL-E] prompt:', prompt);
    const resp = await openai.images.generate({ prompt, n: 1, size: '512x512' });
    const url = resp.data[0].url;
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    const file = path.join(__dirname, `img_${Date.now()}.jpg`);
    fs.writeFileSync(file, res.data);
    console.log('[DALL-E] image saved:', file);
    return file;
  } catch (err) {
    console.error('[DALL-E] error:', err);
    throw err;
  }
}

module.exports = { generateImage };
