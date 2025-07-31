# entvas-nextjs-express-ts-ws

A full-stack real-time analytics application built with Next.js, Express, TypeScript, and PostgreSQL.

## 🏗️ Architecture

This project consists of three main components:

- **API Server** (`api/`) - Express.js backend with PostgreSQL database
- **Client Application** (`client/`) - Next.js frontend dashboard
- **Data Feeder** (`feeder.py`) - Python script for generating test data

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Docker and Docker Compose
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd entvas
```

### 2. Setup PostgreSQL Database

Set up a PostgreSQL database and update the `DATABASE_URL` in `api/.env`

### 3. Setup API Server

```bash
cd api

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

### 4. Setup Client Application

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

### 5. Run Data Feeder (Optional)

```bash
# In a new terminal, from the root directory
python3 feeder.py
```

## 📊 Database Setup

The application uses PostgreSQL with Prisma ORM. See [DATABASE.md](api/DATABASE.md) for detailed setup instructions.

### Database Access

Update `DATABASE_URL` in `api/.env` to point to your PostgreSQL instance

## 🔧 Available Scripts

### API Server (`api/`)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Create and apply migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

### Client Application (`client/`)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
```

## 🌐 API Endpoints

- `POST /webhook` - Receive webhook events
- `GET /events` - Retrieve events with filtering
- `GET /events/stats` - Get event statistics
- `GET /health` - Health check

## 📈 Features

- **Real-time Analytics Dashboard** with live data visualization
- **Webhook Integration** for receiving external events
- **Event Filtering** by time range and type
- **Statistics and Metrics** with interactive charts
- **PostgreSQL Database** with optimized indexes
- **TypeScript** for type safety across the stack
- **Docker Support** for easy development setup

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Jest with supertest
- **Validation**: Joi schemas

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: Material-UI (MUI) v7
- **Styling**: Tailwind CSS v4
- **Charts**: Chart.js with react-chartjs-2
- **Testing**: Jest with React Testing Library

### Infrastructure
- **Database**: PostgreSQL
- **Data Generation**: Python script

## 📁 Project Structure

```
entvas/
├── api/                    # Express.js API server
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── schemas/       # Validation schemas
│   │   └── types/         # TypeScript types
│   ├── prisma/            # Database schema and migrations
│   └── tests/             # API tests
├── client/                # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js app router
│   │   └── components/   # React components
│   └── public/           # Static assets
├── feeder.py             # Data generation script
├── docker-compose.yml    # Database services
└── README.md            # This file
```

## 🔍 Development

### Database Management

```bash
# View database in Prisma Studio
cd api && npm run db:studio

# Push schema changes
cd api && npm run db:push
```

### Testing

```bash
# Run API tests
cd api && npm run test

# Run client tests
cd client && npm run test
```

## 🚀 Deployment

### Production Database

1. Set up a PostgreSQL instance (AWS RDS, Google Cloud SQL, etc.)
2. Update `DATABASE_URL` in environment variables
3. Run migrations: `npm run db:migrate:deploy`

### API Deployment

1. Build the application: `npm run build`
2. Set production environment variables
3. Start the server: `npm start`

### Client Deployment

1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
