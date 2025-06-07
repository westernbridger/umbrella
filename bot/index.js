const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const P = require('pino');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, 'MONGODB_URI=\n');
  console.warn(
    'Warning: .env file not found. Created a new one — please fill in your MongoDB URI.'
  );
}

require('dotenv').config({ path: envPath });

const { handleMessage } = require('./handlers/messageHandler');
const { handleReaction } = require('./handlers/reactionHandler');
const { startScheduler } = require('../utils/scheduler');

async function startSock() {
  const authPath = path.resolve(__dirname, '../auth');
  const { state, saveCreds } = await useMultiFileAuthState(authPath);
  const { version } = await fetchLatestBaileysVersion();
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in .env');
  }
  if (!mongoUri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with mongodb+srv://');
  }
  await mongoose.connect(mongoUri, {});
  console.log('MongoDB Connected');
  const sock = makeWASocket({ logger: P({ level: 'silent' }), version, auth: state });

  startScheduler(sock);

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
    try {
      await handleMessage(sock, m);
    } catch (err) {
      if (/decrypt/i.test(err.message)) {
        console.warn('[Session]', 'Decryption failed, restarting session...');
        try { await sock.logout(); } catch (_) {}
        startSock();
      } else {
        console.error('Message error:', err);
      }
    }
  });

  sock.ev.on('messages.reaction', async (reactions) => {
    for (const r of reactions) {
      await handleReaction(sock, r);
    }
  });
}

startSock().catch((err) => console.error('Startup error:', err));
