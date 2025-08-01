# API Dockerfile
FROM node:18-alpine AS base

# Set npm configuration to avoid SSL issues
ENV NPM_CONFIG_REGISTRY=https://registry.npmjs.org/
ENV NPM_CONFIG_STRICT_SSL=false
ENV NPM_CONFIG_TIMEOUT=600000
ENV NPM_CONFIG_FETCH_RETRIES=5
ENV NPM_CONFIG_FETCH_RETRY_FACTOR=2
ENV NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=10000
ENV NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=60000

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8000

CMD ["npm", "start"] 