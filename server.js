// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const requestRoutes = require('./routes/requestRoutes');

const app = express();
const PORT = process.env.PORT || 5000;


// ✅ Middleware
app.use(express.json()); // IMPORTANT: lets us read req.body
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(morgan('dev'));

// ✅ Routes
app.use('/api/requests', requestRoutes);

// Health check
app.get('/', (req, res) => res.send('Gatepass backend running 🚀'));

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

// ✅ MongoDB URI builder
const buildFromParts = () => {
  if (!process.env.MONGO_USER || !process.env.MONGO_PASS || !process.env.MONGO_HOST || !process.env.MONGO_DB) return null;
  const user = process.env.MONGO_USER;
  const pass = encodeURIComponent(process.env.MONGO_PASS);
  const host = process.env.MONGO_HOST;
  const db = process.env.MONGO_DB;
  return `mongodb+srv://${user}:${pass}@${host}/${db}?retryWrites=true&w=majority`;
};

// ✅ Get Mongo URI from .env
const MONGO_URI = process.env.MONGO_URI || buildFromParts();
if (!MONGO_URI) {
  console.error('❌ MONGO_URI or MONGO_USER/MONGO_PASS/MONGO_HOST/MONGO_DB missing');
  process.exit(1);
}

// ✅ Connect MongoDB and start server
(async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
  } catch (err) {
    console.error('❌ Failed to connect MongoDB:', err.message);
    process.exit(1);
  }
})();
