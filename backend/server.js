const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
// Default limit is ~100kb; base64 profile photos exceed that easily
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/diary', require('./routes/diary'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/search',        require('./routes/search'));
app.use('/api/resume',        require('./routes/resume'));

app.get('/', (req, res) => {
  res.send('AI Career Copilot API is running');
});

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ai-career-copilot")
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    // Keep server running even if DB fails to connect initially for local dev without Atlas
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (DB not connected)`));
  });
