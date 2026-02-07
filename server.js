// backend/server.js
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Import routes
const aiRoutes = require('./routes/ai');
const flightsRoutes = require('./routes/flights');
const hotelsRoutes = require('./routes/hotels');
const activitiesRoutes = require('./routes/activities');
const transportRoutes = require('./routes/transport');
const rewardsRoutes = require('./routes/rewards');
const bookingsRoutes = require('./routes/bookings');

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/flights', flightsRoutes);
app.use('/api/hotels', hotelsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/bookings', bookingsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TravelAI Backend running on port ${PORT}`);
});

module.exports = app;