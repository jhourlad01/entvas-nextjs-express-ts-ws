# Client Service

Next.js/React client application with real-time dashboard, WebSocket integration, and Auth0 authentication.

## Features

- **Real-time Dashboard**: Live analytics with WebSocket updates
- **Instant Filtering**: Pre-segmented data for instant time range switching
- **Authentication**: Auth0 integration with JWT
- **Responsive UI**: Material-UI components
- **Charts**: Chart.js visualizations
- **Performance Optimized**: Memoized components and debounced updates

## Quick Start

### Prerequisites
- Node.js 18+
- Auth0 account (for authentication)

### Installation
```bash
npm install
```

### Environment Setup

#### Production (Docker)
The production environment is configured in `.env.production`:
```bash
# Production settings for Docker deployment
NEXT_PUBLIC_WS_URL=ws://localhost/ws
NEXT_PUBLIC_AUTH0_REDIRECT_URI=http://localhost
NEXT_PUBLIC_API_URL=http://localhost
# ... other production settings
```

#### Development (npm)
For local development, create environment from example:
```bash
cp env.example .env.local
# Edit .env.local with your local configuration
```

### Development
```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `ws://localhost:8000` |
| `NEXT_PUBLIC_API_URL` | API server URL | `http://localhost:8000` |
| `NEXT_PUBLIC_AUTH0_DOMAIN` | Auth0 domain | Required |
| `NEXT_PUBLIC_AUTH0_CLIENT_ID` | Auth0 client ID | Required |
| `NEXT_PUBLIC_AUTH0_AUDIENCE` | Auth0 audience | Required |
| `NEXT_PUBLIC_AUTH0_REDIRECT_URI` | Auth0 redirect URI | `http://localhost:3000` |
| `NEXT_PUBLIC_RECONNECT_INTERVAL` | WebSocket reconnect interval | `10000` |

## Architecture

### Directory Structure
```
src/
├── app/              # Next.js app router
│   ├── page.tsx      # Main dashboard
│   └── not-found.tsx # 404 page
├── components/       # React components
│   └── dashboard/    # Dashboard-specific components
├── hooks/            # Custom hooks
│   ├── useWebSocket.ts
│   └── useApi.ts
└── services/         # API services
    └── api.ts
```

### Key Components

- **Dashboard**: Main analytics dashboard
- **EventsPerMinuteChart**: Real-time events chart
- **TopEventTypes**: Event type distribution
- **useWebSocket**: WebSocket connection hook
- **useApi**: API data fetching hook

## Real-time Features

### WebSocket Integration
- **Single Source of Truth**: All data comes from WebSocket
- **Pre-segmented Data**: Server-side computation for all time ranges
- **Instant Filtering**: No API calls when switching filters
- **Automatic Reconnection**: Built-in reconnection logic

### Performance Optimizations
- **Memoized Components**: React.memo for chart components
- **Debounced Updates**: 300ms debounce for WebSocket updates
- **Animation Disabled**: Chart animations disabled for performance
- **Loading States**: Smooth loading transitions

## Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run tests with watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run E2E tests (if configured)
npm run test:e2e
```

## Docker

### Build
```bash
docker build -t entvas-client .
```

### Run
```bash
docker run -p 3000:3000 entvas-client
```

## Development

### Code Quality
- **ESLint**: Code linting and formatting
- **TypeScript**: Type safety
- **Prettier**: Code formatting

### Hot Reload
- **Fast Refresh**: Next.js fast refresh for development
- **WebSocket Reconnection**: Automatic reconnection in development

## Performance

### Optimizations
- **Image Optimization**: Next.js built-in image optimization
- **Code Splitting**: Automatic code splitting
- **Bundle Analysis**: Webpack bundle analysis
- **Caching**: Browser and CDN caching

### Monitoring
- **Core Web Vitals**: Performance metrics
- **Error Tracking**: Error boundary and logging
- **Analytics**: User behavior tracking (optional)

## Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod
```

### Docker
```bash
# Build and run with Docker
docker build -t entvas-client .
docker run -p 3000:3000 entvas-client
```

### Static Export
```bash
# Build static export
npm run build
npm run export
```

## Troubleshooting

### Common Issues

#### WebSocket Connection
- Check `NEXT_PUBLIC_WS_URL` environment variable
- Verify API service is running
- Check browser console for connection errors

#### Authentication
- Verify Auth0 configuration
- Check redirect URIs in Auth0 dashboard
- Ensure JWT tokens are valid

#### Performance
- Monitor bundle size with `npm run analyze`
- Check for memory leaks in development
- Optimize images and assets
