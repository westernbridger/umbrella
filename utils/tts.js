const gTTS = require('google-tts-api');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const which = require('which');

let ffmpegPath;
try {
  ffmpegPath = which.sync('ffmpeg');
  ffmpeg.setFfmpegPath(ffmpegPath);
} catch (err) {
  console.warn('[TTS] ffmpeg not found in PATH');
}

function chunkText(text, size = 200) {
  const parts = [];
  for (let i = 0; i < text.length; i += size) {
    parts.push(text.slice(i, i + size));
  }
  return parts;
}

async function createVoiceFiles(text) {
  if (!ffmpegPath) throw new Error('ffmpeg is required for TTS');
  if (text.length > 1000) throw new Error('Text too long for TTS');
  const files = [];
  const parts = chunkText(text);
  for (const part of parts) {
    const url = gTTS.getAudioUrl(part, { lang: 'en', slow: false });
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    const out = path.join(__dirname, `tts_${Date.now()}_${Math.random()}.mp3`);
    fs.writeFileSync(out, res.data);
    files.push(out);
  }
  return files;
}

module.exports = { createVoiceFiles };
