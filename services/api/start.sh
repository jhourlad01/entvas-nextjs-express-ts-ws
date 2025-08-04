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

# Run Prisma migrations in background with timeout
echo "Running Prisma database push..."
timeout 30s npx prisma db push --accept-data-loss &
PRISMA_PID=$!

# Start the application immediately
echo "Starting Node.js server..."
node dist/server.js &

# Wait for Prisma to complete (but don't block server startup)
wait $PRISMA_PID 2>/dev/null || {
    echo "Prisma db push completed or timed out"
}

# Keep the script running
wait 