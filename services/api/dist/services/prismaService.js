"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Create a singleton instance of PrismaClient
const prisma = new client_1.PrismaClient();
// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
exports.default = prisma;
//# sourceMappingURL=prismaService.js.map