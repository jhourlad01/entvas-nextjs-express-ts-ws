# Database Service

PostgreSQL database service for event data persistence and analytics.

## Features

- **PostgreSQL 15**: Latest stable PostgreSQL version
- **Data Persistence**: Persistent volume storage
- **Initialization Scripts**: Automated database setup
- **Connection Pooling**: Efficient connection management
- **Backup Support**: Database backup and restore capabilities

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | `entvas_db` |
| `POSTGRES_USER` | Database user | `entvas_user` |
| `POSTGRES_PASSWORD` | Database password | `entvas_password` |
| `POSTGRES_HOST_AUTH_METHOD` | Authentication method | `scram-sha-256` |

### Database Schema

The database is initialized with the following schema:

```sql
-- Events table for storing webhook events
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    metadata JSONB,
    received_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_received_at ON events(received_at);
```

## Setup

### Development Setup
```bash
# Start database service
docker-compose up database

# Connect to database
docker-compose exec database psql -U entvas_user -d entvas_db

# Check database logs
docker-compose logs database
```

### Production Setup
```bash
# Start with persistent storage
docker-compose up -d database

# Verify database connection
docker-compose exec database pg_isready -U entvas_user -d entvas_db
```

## Database Management

### Connection
```bash
# Connect to database
docker-compose exec database psql -U entvas_user -d entvas_db

# List tables
\dt

# Describe table
\d events

# Run SQL query
SELECT COUNT(*) FROM events;
```

### Backup and Restore
```bash
# Create backup
docker-compose exec database pg_dump -U entvas_user entvas_db > backup.sql

# Restore from backup
docker-compose exec -T database psql -U entvas_user entvas_db < backup.sql

# Create compressed backup
docker-compose exec database pg_dump -U entvas_user entvas_db | gzip > backup.sql.gz

# Restore from compressed backup
gunzip -c backup.sql.gz | docker-compose exec -T database psql -U entvas_user entvas_db
```

### Performance Monitoring
```bash
# Check database size
docker-compose exec database psql -U entvas_user -d entvas_db -c "SELECT pg_size_pretty(pg_database_size('entvas_db'));"

# Check table sizes
docker-compose exec database psql -U entvas_user -d entvas_db -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables WHERE schemaname = 'public';"

# Check index usage
docker-compose exec database psql -U entvas_user -d entvas_db -c "SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch FROM pg_stat_user_indexes;"
```

## Data Operations

### Event Queries
```sql
-- Get total events
SELECT COUNT(*) FROM events;

-- Get events by type
SELECT event_type, COUNT(*) FROM events GROUP BY event_type;

-- Get recent events
SELECT * FROM events ORDER BY received_at DESC LIMIT 10;

-- Get events in time range
SELECT * FROM events 
WHERE received_at >= NOW() - INTERVAL '1 hour'
ORDER BY received_at DESC;
```

### Analytics Queries
```sql
-- Events per hour (last 24 hours)
SELECT 
    DATE_TRUNC('hour', received_at) as hour,
    COUNT(*) as event_count
FROM events 
WHERE received_at >= NOW() - INTERVAL '24 hours'
GROUP BY hour 
ORDER BY hour;

-- Top event types
SELECT 
    event_type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM events), 2) as percentage
FROM events 
GROUP BY event_type 
ORDER BY count DESC;
```

## Maintenance

### Vacuum and Analyze
```bash
# Run vacuum
docker-compose exec database psql -U entvas_user -d entvas_db -c "VACUUM ANALYZE;"

# Check table statistics
docker-compose exec database psql -U entvas_user -d entvas_db -c "SELECT schemaname, tablename, last_vacuum, last_analyze FROM pg_stat_user_tables;"
```

### Connection Pooling
```bash
# Check active connections
docker-compose exec database psql -U entvas_user -d entvas_db -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# Check connection limits
docker-compose exec database psql -U entvas_user -d entvas_db -c "SHOW max_connections;"
```

## Security

### User Management
```sql
-- Create new user
CREATE USER new_user WITH PASSWORD 'password';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON events TO new_user;

-- Revoke permissions
REVOKE DELETE ON events FROM new_user;
```

### SSL Configuration
```bash
# Enable SSL (if needed)
docker-compose exec database psql -U entvas_user -d entvas_db -c "SHOW ssl;"

# Check SSL certificate
docker-compose exec database psql -U entvas_user -d entvas_db -c "SHOW ssl_cert_file;"
```

## Troubleshooting

### Common Issues

#### Connection Refused
- Check if database container is running
- Verify port 5432 is not in use
- Check database logs for errors

#### Authentication Failed
- Verify username and password
- Check environment variables
- Ensure database exists

#### Performance Issues
- Check for long-running queries
- Monitor disk space usage
- Review index usage statistics

### Debug Commands
```bash
# Check database status
docker-compose exec database pg_isready -U entvas_user -d entvas_db

# View database logs
docker-compose logs database

# Check disk usage
docker-compose exec database df -h

# Check memory usage
docker-compose exec database free -h
```

## Scaling

### Read Replicas
```yaml
# Add read replica to docker-compose.yml
database-replica:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: ${POSTGRES_DB:-entvas_db}
    POSTGRES_USER: ${POSTGRES_USER:-entvas_user}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-entvas_password}
  volumes:
    - postgres_data:/var/lib/postgresql/data
  networks:
    - entvas-network
```

### Backup Strategy
- **Daily Backups**: Automated daily backups
- **Point-in-Time Recovery**: WAL archiving for PITR
- **Cross-Region Replication**: Geographic redundancy
- **Monitoring**: Backup success/failure monitoring 