const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const botRoutes = require('./routes/bots');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/bots', botRoutes);

async function start() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI is not defined in .env');
  await mongoose.connect(mongoUri, {});
  console.log('MongoDB Connected');
  const PORT = process.env.API_PORT || 3001;
  app.listen(PORT, () => console.log(`[API] Listening on port ${PORT}`));
}

start().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});
