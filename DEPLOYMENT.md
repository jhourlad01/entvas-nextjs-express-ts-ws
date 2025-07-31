# Deployment Guide

## Live URLs

- **Dashboard**: [https://entvas-dashboard.vercel.app](https://entvas-dashboard.vercel.app)
- **API**: [https://entvas-api.onrender.com](https://entvas-api.onrender.com)
- **Repo**: [https://github.com/yourusername/entvas](https://github.com/yourusername/entvas)

## Quick Deploy

### 1. Database Setup
```bash
# Option A: Supabase (Free)
# Go to supabase.com, create project, get connection string

# Option B: Neon (Free)
# Go to neon.tech, create project, get connection string
```

### 2. Deploy API (Render)
1. Connect GitHub repo to Render
2. Select `api` directory
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Add env vars:
   ```
   NODE_ENV=production
   DATABASE_URL=your_postgresql_connection_string
   ```

### 3. Deploy Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Select `client` directory
3. Add env vars:
   ```
   NEXT_PUBLIC_WS_URL=wss://your-api-name.onrender.com
   ```

## Environment Variables

### API (.env)
```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://username:password@host:port/database
```

### Client (.env.local)
```bash
NEXT_PUBLIC_WS_URL=wss://your-api-domain.com
```

## Database Migration
```bash
cd api
npm run db:generate
npm run db:migrate:deploy
```

## Testing API

```bash
# Test webhook
curl -X POST https://your-api.onrender.com/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "page_view",
    "userId": "user123",
    "timestamp": "2024-01-01T12:00:00Z",
    "metadata": {"page": "/home"}
  }'

# Test events
curl "https://your-api.onrender.com/events?timeRange=hour"
```

## Cost Breakdown

### Free Setup
- Frontend: Vercel (Free)
- Backend: Render (Free)
- Database: Supabase (Free)
- **Total: $0/month**

### Small Production
- Frontend: Vercel (Free)
- Backend: Render ($7/month)
- Database: Supabase (Free)
- **Total: $7/month**

## Troubleshooting

### Common Issues
1. **Database Connection**: Check DATABASE_URL format
2. **WebSocket**: Verify NEXT_PUBLIC_WS_URL
3. **Build Failures**: Check Node.js version (18+)

### Debug
```bash
# Check API logs
cd api && npm run dev

# Check database
cd api && npm run db:studio
``` 