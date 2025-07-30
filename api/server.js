const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const webhookRoutes = require('./routes/webhook');
const indexRoutes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Mount routes
app.use('/webhook', webhookRoutes);
app.use('/', indexRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`Events endpoint: http://localhost:${PORT}/webhook/events`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server }; 