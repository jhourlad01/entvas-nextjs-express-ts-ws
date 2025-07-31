# Demo API

Express server for handling webhook events from the feeder.

## Setup

### Option 1: Docker (Recommended)
```bash
# From project root
docker-compose up api
```

### Option 2: Local Development
```bash
npm install
npm run dev
```

## Environment Variables
```bash
NODE_ENV=development
PORT=8000
DATABASE_URL=postgresql://entvas_user:entvas_password@postgres:5432/entvas_db
LOG_LEVEL=info
```