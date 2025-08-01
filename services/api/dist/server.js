"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const webhook_1 = __importDefault(require("./routes/webhook"));
const events_1 = __importDefault(require("./routes/events"));
const index_1 = __importDefault(require("./routes/index"));
const errorHandling_1 = require("./middleware/errorHandling");
const logging_1 = require("./middleware/logging");
const websocketService_1 = require("./services/websocketService");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = parseInt(process.env['PORT'] || '3001', 10);
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('combined'));
// Request logging middleware
app.use(logging_1.requestLogger);
// Mount routes
app.use('/webhook', webhook_1.default);
app.use('/events', events_1.default);
app.use('/', index_1.default);
// Error handling middleware
app.use(errorHandling_1.errorHandler);
// 404 handler
app.use('*', errorHandling_1.notFoundHandler);
// Initialize WebSocket server
websocketService_1.webSocketService.initialize(server);
// Start server
server.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] Server started on port ${PORT}`);
    console.log(`[${new Date().toISOString()}] WebSocket server available at ws://localhost:${PORT}`);
    console.log(`[${new Date().toISOString()}] Available endpoints:`);
    console.log(`  POST http://localhost:${PORT}/webhook`);
    console.log(`  GET  http://localhost:${PORT}/events`);
    console.log(`  GET  http://localhost:${PORT}/events?filter=hour|day|week`);
    console.log(`  GET  http://localhost:${PORT}/events/stats`);
    console.log(`  GET  http://localhost:${PORT}/events/stats?filter=hour|day|week`);
    console.log(`  GET  http://localhost:${PORT}/health`);
    console.log(`  GET  http://localhost:${PORT}/`);
    console.log('---');
});
exports.default = app;
//# sourceMappingURL=server.js.map