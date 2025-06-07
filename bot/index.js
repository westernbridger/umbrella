const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const P = require('pino');
const { OpenAI } = require('openai');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const express = require('express');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (_, res) => res.send('Bot is running'));
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

async function askGPT(prompt) {
  try {
    console.log('Sending prompt to GPT:', prompt);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });
    const reply = completion.choices[0].message.content.trim();
    console.log('GPT replied');
    return reply;
  } catch (err) {
    console.error('GPT error:', err);
    throw err;
  }
}

function chunkText(text, size = 200) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

async function sendVoice(sock, jid, text, quoted) {
  const parts = chunkText(text);
  for (const part of parts) {
    try {
      console.log('Generating TTS');
      const response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova',
        input: part,
        response_format: 'mp3',
      });
      const rawPath = path.join(__dirname, `tts_raw_${Date.now()}.mp3`);
      const finalPath = path.join(__dirname, `tts_${Date.now()}.mp3`);
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(rawPath, buffer);
      await new Promise((res, rej) => {
        ffmpeg(rawPath)
          .toFormat('mp3')
          .on('end', res)
          .on('error', rej)
          .save(finalPath);
      });
      fs.unlinkSync(rawPath);
      await sock.sendMessage(
        jid,
        { audio: { url: finalPath }, mimetype: 'audio/mpeg', ptt: true },
        { quoted }
      );
      fs.unlinkSync(finalPath);
    } catch (err) {
      console.error('TTS error:', err);
    }
  }
}

async function sendText(sock, jid, text, quoted) {
  const chunks = chunkText(text, 4096);
  for (const chunk of chunks) {
    await sock.sendMessage(jid, { text: chunk }, { quoted });
  }
}

async function generateImage(prompt) {
  try {
    console.log('Generating image for:', prompt);
    const resp = await openai.images.generate({ prompt, n: 1, size: '512x512' });
    const url = resp.data[0].url;
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    const file = path.join(__dirname, `img_${Date.now()}.jpg`);
    fs.writeFileSync(file, res.data);
    console.log('Image saved', file);
    return file;
  } catch (err) {
    console.error('Image generation error:', err);
    throw err;
  }
}

async function startSock() {
  const authFolder = path.join(__dirname, 'baileys_auth');
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({ version, auth: state, logger: P({ level: 'silent' }) });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('Scan the QR code below:');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log('Connection closed:', reason);
      if (reason !== DisconnectReason.loggedOut && reason !== 401) {
        console.log('Reconnecting...');
        startSock();
      } else {
        console.log('Logged out.');
      }
    } else if (connection === 'open') {
      console.log('Connection opened');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      m.message.videoMessage?.caption ||
      '';
    if (!text) return;

    const from = m.key.remoteJid;
    console.log('Message received:', text);

    try {
      if (!text.toLowerCase().startsWith('@zaphar')) return;

      let prompt = text.replace(/^@zaphar/i, '').trim();
      let wantVoice = false;

      if (text.toLowerCase().startsWith('@zaphar voice:')) {
        wantVoice = true;
        prompt = text.replace(/^@zaphar voice:/i, '').trim();
      }

      if (!prompt) return;

      const imgMatch = prompt.match(/generate image:\s*(.*)/i);
      if (imgMatch) {
        const imgPath = await generateImage(imgMatch[1]);
        await sock.sendMessage(from, { image: { url: imgPath } }, { quoted: m });
        fs.unlinkSync(imgPath);
        return;
      }

      const reply = await askGPT(prompt);
      await sendText(sock, from, reply, m);
      if (wantVoice) {
        await sendVoice(sock, from, reply, m);
      }
    } catch (err) {
      console.error('Processing error:', err);
      await sock.sendMessage(from, { text: '⚠️ Sorry, something went wrong. Try again later!' }, { quoted: m });
    }
  });
}

startSock().catch((err) => console.error('Startup error:', err));
