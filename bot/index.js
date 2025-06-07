const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require('baileys');
const P = require('pino');
const { OpenAI } = require('openai');
const googleTTS = require('google-tts-api');
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
    logger: P({ level: 'silent' })
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('connection closed due to', lastDisconnect?.error, ', reconnect', shouldReconnect);
      if (shouldReconnect) startSock();
    } else if (connection === 'open') {
      console.log('connection opened');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
    if (!text.startsWith('@zaphar')) return;

    const prompt = text.slice('@zaphar'.length).trim();
    if (!prompt) return;

    try {
      if (/generate image:/i.test(prompt)) {
        const imagePrompt = prompt.split(/generate image:/i)[1].trim();
        const imgResp = await openai.images.generate({ prompt: imagePrompt, n: 1, size: '512x512' });
        const imageUrl = imgResp.data[0].url;
        const res = await fetch(imageUrl);
        const buffer = await res.buffer();
        const imgPath = path.join(__dirname, 'image.jpg');
        fs.writeFileSync(imgPath, buffer);
        await sock.sendMessage(m.key.remoteJid, { image: fs.readFileSync(imgPath) }, { quoted: m });
        fs.unlinkSync(imgPath);
      } else {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }]
        });
        const reply = completion.choices[0].message.content.trim();
        await sock.sendMessage(m.key.remoteJid, { text: reply }, { quoted: m });

        const url = googleTTS.getAudioUrl(reply, { lang: 'en', slow: false });
        const audioRes = await fetch(url);
        const audioBuffer = await audioRes.buffer();
        const audioPath = path.join(__dirname, 'tts.mp3');
        fs.writeFileSync(audioPath, audioBuffer);
        await sock.sendMessage(
          m.key.remoteJid,
          { audio: { url: audioPath }, mimetype: 'audio/mpeg', ptt: true },
          { quoted: m }
        );
        fs.unlinkSync(audioPath);
      }
    } catch (err) {
      console.error('processing error:', err);
      await sock.sendMessage(m.key.remoteJid, { text: '⚠️ Sorry, something went wrong. Try again later!' }, { quoted: m });
    }
  });
}

startSock().catch(err => console.error('startup error:', err));
