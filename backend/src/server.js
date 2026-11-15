/**
 * Express.js Application Server
 * Intelligent Spoilage-Aware Coordination and Optimization of Perishable Agricultural Supply Chains
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const farmRoutes = require('./routes/farms');
const batchRoutes = require('./routes/batches');
const retailerRoutes = require('./routes/retailers');
const storageRoutes = require('./routes/storage');
const transportRoutes = require('./routes/transport');
const optimizationRoutes = require('./routes/optimization');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/farms', farmRoutes);
app.use('/api/v1/batches', batchRoutes);
app.use('/api/v1/retailers', retailerRoutes);
app.use('/api/v1/storage', storageRoutes);
app.use('/api/v1/transport', transportRoutes);
app.use('/api/v1/optimization', optimizationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'AgriSupplyChain Backend Server',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start Server if not imported by test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`==================================================================`);
    console.log(`AgriSupplyChain Backend Server listening on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`==================================================================`);
  });
}

module.exports = app;
