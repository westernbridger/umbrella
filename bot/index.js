const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const P = require('pino');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { askGPT } = require('../utils/gpt');
const { createVoiceFiles } = require('../utils/tts');
const { generateImage } = require('../utils/image');

async function startSock() {
  const authPath = path.join(__dirname, 'auth');
  const { state, saveCreds } = await useMultiFileAuthState(authPath);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({ logger: P({ level: 'silent' }), version, auth: state });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('Scan QR to connect:');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log('Connection closed:', reason);
      if (reason !== DisconnectReason.loggedOut && reason !== 401) {
        startSock();
      } else {
        console.log('Logged out.');
      }
    } else if (connection === 'open') {
      console.log('✅ Connected to WhatsApp');
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
    if (!text.toLowerCase().startsWith('@zaphar')) return;

    const from = m.key.remoteJid;
    if (from.endsWith('@g.us') && !text.toLowerCase().includes('@zaphar')) return;
    console.log('[MSG]', from, text);

    const prompt = text.replace(/^@zaphar\s*/i, '');
    const quoted = m;

    try {
      if (/^voice:\s*/i.test(prompt)) {
        const topic = prompt.replace(/^voice:\s*/i, '');
        const reply = await askGPT(topic);
        try {
          const files = await createVoiceFiles(reply);
          for (const file of files) {
            await sock.sendMessage(
              from,
              { audio: { url: file }, mimetype: 'audio/mpeg', ptt: true },
              { quoted }
            );
            fs.unlinkSync(file);
          }
        } catch (err) {
          console.error('[TTS]', err);
          await sock.sendMessage(from, { text: 'Failed to generate voice note.' }, { quoted });
        }
        return;
      }

      const imgMatch = prompt.match(/^generate image:\s*(.+)/i);
      if (imgMatch) {
        try {
          const imgPath = await generateImage(imgMatch[1]);
          await sock.sendMessage(from, { image: { url: imgPath } }, { quoted });
          fs.unlinkSync(imgPath);
        } catch (err) {
          console.error('[IMG]', err);
          await sock.sendMessage(from, { text: 'Image generation failed.' }, { quoted });
        }
        return;
      }

      const reply = await askGPT(prompt);
      await sock.sendMessage(from, { text: reply }, { quoted });
    } catch (err) {
      console.error('[ERROR]', err);
      await sock.sendMessage(from, { text: '⚠️ Something went wrong.' }, { quoted });
    }
  });
}

startSock().catch((err) => console.error('Startup error:', err));
