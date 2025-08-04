#!/bin/sh

# Set Node.js memory limits
export NODE_OPTIONS="--max-old-space-size=256"

# Function to handle cleanup on exit
cleanup() {
    echo "Shutting down gracefully..."
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

echo "Starting application..."

# Run Prisma migrations with timeout and retry logic
echo "Running Prisma database push..."
timeout 60s npx prisma db push --accept-data-loss || {
    echo "Prisma db push failed or timed out, continuing anyway..."
}

# Start the application
echo "Starting Node.js server..."
exec node dist/server.js 