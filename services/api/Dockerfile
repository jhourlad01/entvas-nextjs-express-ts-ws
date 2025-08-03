# Base with full deps to build locally
FROM node:18-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Final stage with only prod deps
FROM node:18-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --silent

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
# USER nodejs

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/server.js"]
