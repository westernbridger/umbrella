const { create } = require('@open-wa/wa-automate');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const apiRoutes = require('../routes/api');
const authRoutes = require('../routes/auth');
const botRoutes = require('../routes/bots');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// ---- Express API Setup ----
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/bots', botRoutes);

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => console.log(`[API] Listening on port ${PORT}`));

// TODO: Expose real data from the bot inside routes/api.js

const { handleOpenWaMessage } = require('./handlers/openwaMessageHandler');
const { startScheduler } = require('../utils/scheduler');

async function start() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in .env');
  }
  await mongoose.connect(mongoUri, {});
  console.log('MongoDB Connected');

  const headless = process.env.HEADLESS !== 'false';
  if (headless) {
    console.warn('[BOT] Running in headless mode. Some features may be harder to debug.');
  } else {
    console.log('[BOT] Headless mode disabled for debugging');
  }

  const client = await create({
    sessionId: 'zaphar',
    multiDevice: true,
    authTimeout: 60,
    headless,
  });

  const botNumber = await client.getHostNumber();
  const botId = `${botNumber}@c.us`;

  startScheduler((chatId, text) => client.sendText(chatId, text));


  client.onMessage(async (message) => {
    try {
      await handleOpenWaMessage(client, message, botId);
    } catch (err) {
      console.error('[onMessage]', err);
    }
  });
}

start().catch((err) => console.error('Startup error:', err));
