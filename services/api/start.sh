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

# Run Prisma migrations first (blocking)
echo "Running Prisma database push..."
if npx prisma db push --accept-data-loss; then
    echo "✅ Database migration completed successfully"
else
    echo "❌ Database migration failed, but continuing with server startup"
fi

# Start the application
echo "Starting Node.js server..."
node dist/server.js 