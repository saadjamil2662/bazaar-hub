const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectRedis } = require('./config/redis');
const SocketService = require('./services/socketService');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const auctionRoutes = require('./routes/auctions');
const orderRoutes = require('./routes/orders');
const messageRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const socketService = new SocketService(server);
app.set('io', socketService.getIO());

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bazaar Hub API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Connect to Redis (optional — server still starts if Redis is unavailable)
    try {
      await connectRedis();
      console.log('✓ Redis connected');
    } catch (redisError) {
      console.warn('⚠ Redis not available — continuing without Redis:', redisError.message);
    }

    // Start server
    server.listen(PORT, () => {
      console.log('');
      console.log('=================================');
      console.log('  🚀 Bazaar Hub Server Running');
      console.log('=================================');
      console.log(`  Port: ${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  API: http://localhost:${PORT}/api`);
      console.log('=================================');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
