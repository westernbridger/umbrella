const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require('baileys');
const qrcode = require('qrcode-terminal');
const P = require('pino');
const { OpenAI } = require('openai');
const googleTTS = require('google-tts-api');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function askGPT(prompt) {
  console.log('Sending prompt to GPT:', prompt);
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }]
  });
  const reply = completion.choices[0].message.content.trim();
  console.log('GPT replied');
  return reply;
}

function chunkText(text, size = 4096) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

async function sendVoice(sock, jid, text, quoted) {
  console.log('Generating TTS');
  const url = googleTTS.getAudioUrl(text, { lang: 'en', slow: false });
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  const file = path.join(__dirname, `tts_${Date.now()}.mp3`);
  fs.writeFileSync(file, res.data);
  await sock.sendMessage(jid, { audio: { url: file }, mimetype: 'audio/mpeg', ptt: true }, { quoted });
  fs.unlinkSync(file);
}

async function sendText(sock, jid, text, quoted) {
  const chunks = chunkText(text);
  for (const chunk of chunks) {
    await sock.sendMessage(jid, { text: chunk }, { quoted });
  }
}

async function generateImage(prompt) {
  console.log('Generating image for:', prompt);
  const resp = await openai.images.generate({ prompt, n: 1, size: '512x512' });
  const url = resp.data[0].url;
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  const file = path.join(__dirname, `img_${Date.now()}.jpg`);
  fs.writeFileSync(file, res.data);
  return file;
}

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth');
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

    const text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || '';
    if (!text) return;

    const from = m.key.remoteJid;
    console.log('Message received:', text);

    try {
      if (/generate image:/i.test(text)) {
        const imgPrompt = text.split(/generate image:/i)[1].trim();
        const imgPath = await generateImage(imgPrompt);
        await sock.sendMessage(from, { image: { url: imgPath } }, { quoted: m });
        fs.unlinkSync(imgPath);
        return;
      }

      if (text.toLowerCase().startsWith('@zaphar voice:')) {
        const prompt = text.replace(/^@zaphar voice:/i, '').trim();
        if (!prompt) return;
        const reply = await askGPT(prompt);
        await sendText(sock, from, reply, m);
        await sendVoice(sock, from, reply, m);
        return;
      }

      if (text.toLowerCase().startsWith('@zaphar')) {
        const prompt = text.replace(/^@zaphar/i, '').trim();
        if (!prompt) return;
        const reply = await askGPT(prompt);
        await sendText(sock, from, reply, m);
        return;
      }

      await sock.sendMessage(from, { text: 'Hey! Zaphar is online and ready.' }, { quoted: m });
    } catch (err) {
      console.error('Processing error:', err);
      await sock.sendMessage(from, { text: '⚠️ Sorry, something went wrong. Try again later!' }, { quoted: m });
    }
  });
}

startSock().catch((err) => console.error('Startup error:', err));
