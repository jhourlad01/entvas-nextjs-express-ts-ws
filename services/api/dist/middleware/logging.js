"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
// Request logging middleware
const requestLogger = (req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=logging.js.map