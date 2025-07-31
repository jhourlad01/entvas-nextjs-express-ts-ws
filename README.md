# Real-Time Analytics Dashboard

Web application that receives webhook data and displays live analytics charts.

## Quick Start

```bash
git clone git@github.com:jhourlad01/entvas-nextjs-express-ts-ws.git
cd entvas-nextjs-express-ts-ws
docker-compose up
```

**Access**: Dashboard: http://localhost:3000 | API: http://localhost:8000

## API Testing

### Manual Testing
```bash
# Send webhook
curl -X POST http://localhost:8000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "page_view",
    "userId": "user123", 
    "timestamp": "2024-01-01T12:00:00Z",
    "metadata": {"page": "/home"}
  }'

# Get events
curl "http://localhost:8000/events?timeRange=hour"
```

### Automated Testing
```bash
# Generate test data with feeder.py
python3 feeder.py

# Or with Docker
docker-compose up feeder
```

## Deployment

**Live URLs**
- Dashboard: https://entvas-dashboard.vercel.app
- API: https://entvas-api.onrender.com
- Repo: https://github.com/jhourlad01/entvas-nextjs-express-ts-ws



**Environment Variables**
```bash
# API
DATABASE_URL=postgresql://user:pass@host:5432/db

# Client  
NEXT_PUBLIC_WS_URL=wss://entvas-api.onrender.com
```

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend**: Next.js 15, Material-UI, Chart.js
- **Real-time**: WebSocket



## Troubleshooting

```bash
# Docker
docker-compose ps
docker-compose logs api

# Database
docker-compose exec api npm run db:studio
```


