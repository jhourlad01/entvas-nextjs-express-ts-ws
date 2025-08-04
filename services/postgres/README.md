# PostgreSQL Service

This service provides a production-ready PostgreSQL database optimized for the Entvas analytics platform.

## Architecture

- **Base Image**: PostgreSQL 15 Alpine
- **Optimized Configuration**: Production-ready setup for analytics workloads
- **Persistent Storage**: Docker volume for data persistence
- **Health Checks**: Built-in PostgreSQL health monitoring

## Configuration Files

### `Dockerfile`
Production-ready Dockerfile with:
- PostgreSQL 15 Alpine base image
- Optimized PostgreSQL configuration for analytics workloads
- Security-hardened permissions and user setup
- Built-in health checks
- Comprehensive logging and performance settings

### `postgresql.conf`
Optimized PostgreSQL configuration for:
- **Analytics workloads** (read-heavy operations)
- **Memory optimization** (shared_buffers, work_mem)
- **Query performance** (statistics, parallel workers)
- **Logging and monitoring** (comprehensive logging)
- **Autovacuum settings** (automatic maintenance)

### `pg_hba.conf`
Host-based authentication configuration:
- Secure local connections
- Docker network access
- Replication support
- Proper authentication methods

### `init-db.sql`
Database initialization script that:
- Creates the database schema
- Sets up indexes for optimal performance
- Configures initial settings

## Event Data Structure

The database stores events with the following structure:

### Event Table Schema
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eventType VARCHAR(50) NOT NULL,
    userId UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Event Types
- `page_view` - User viewed a page
- `user_joined` - User joined the system
- `user_disconnect` - User disconnected
- `log` - General log event
- `user_message` - User sent a message

### Metadata Structure
```json
{
  "page": "home|profile|settings|dashboard",
  "browser": "chrome|firefox|safari|edge"
}
```

### Indexes for Performance
- `(timestamp, eventType)` - For time-based filtering with event type
- `(userId, timestamp)` - For user-specific time-based queries
- `(eventType, timestamp)` - For event type analysis over time

## Performance Optimizations

### Memory Settings
- `shared_buffers = 256MB` - Cache for frequently accessed data
- `effective_cache_size = 1GB` - Estimated available memory
- `work_mem = 4MB` - Memory for query operations

### Query Performance
- `default_statistics_target = 100` - Better query planning
- `random_page_cost = 1.1` - Optimized for SSD storage
- `effective_io_concurrency = 200` - Parallel I/O operations

### Parallel Processing
- `max_worker_processes = 2` - Background worker processes
- `max_parallel_workers_per_gather = 1` - Parallel query execution
- `max_parallel_workers = 2` - Total parallel workers

## Security Features

- **Network isolation** via Docker networks
- **Authentication** via pg_hba.conf
- **Proper file permissions** (600 for pg_hba.conf)
- **Environment variable** configuration
- **Health checks** for monitoring

## Usage

### Development
```bash
# Start the postgres service
docker-compose up -d postgres

# Check logs
docker-compose logs postgres

# Connect to database
docker-compose exec database psql -U entvas_user -d entvas_db
```

### Production
```bash
# Deploy postgres service
docker-compose -f docker-compose.yml up -d postgres
```

## Monitoring

### Health Checks
The service includes built-in health checks:
```bash
# Check service health
docker-compose ps postgres

# View health check logs
docker-compose logs postgres
```

### Performance Monitoring
```bash
# Check active connections
docker-compose exec postgres psql -U entvas_user -d entvas_db -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# View database size
docker-compose exec postgres psql -U entvas_user -d entvas_db -c "SELECT pg_size_pretty(pg_database_size('entvas_db'));"

# Check index usage
docker-compose exec postgres psql -U entvas_user -d entvas_db -c "SELECT schemaname, tablename, indexname, idx_scan FROM pg_stat_user_indexes;"
```

## Backup and Recovery

### Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U entvas_user entvas_db > backup.sql

# Create compressed backup
docker-compose exec postgres pg_dump -U entvas_user entvas_db | gzip > backup.sql.gz
```

### Restore
```bash
# Restore from backup
docker-compose exec -T postgres psql -U entvas_user -d entvas_db < backup.sql

# Restore from compressed backup
gunzip -c backup.sql.gz | docker-compose exec -T postgres psql -U entvas_user -d entvas_db
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if service is running: `docker-compose ps postgres`
   - Verify network connectivity: `docker network ls`

2. **Authentication Failed**
   - Verify environment variables
   - Check pg_hba.conf configuration
   - Ensure proper credentials

3. **Performance Issues**
   - Monitor memory usage
   - Check query performance with `EXPLAIN ANALYZE`
   - Review PostgreSQL logs

### Useful Commands

```bash
# View PostgreSQL logs
docker-compose logs postgres

# Check PostgreSQL configuration
docker-compose exec postgres psql -U entvas_user -d entvas_db -c "SHOW shared_buffers;"

# Monitor slow queries
docker-compose exec postgres psql -U entvas_user -d entvas_db -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | `entvas_db` | Database name |
| `POSTGRES_USER` | `entvas_user` | Database user |
| `POSTGRES_PASSWORD` | `entvas_password` | Database password |

## Data Persistence

Data is persisted using Docker volumes:
- **Volume**: `postgres_data`
- **Location**: `/var/lib/postgresql/data`
- **Backup**: Regular backups recommended

## Scaling Considerations

For production scaling:
- Consider using managed PostgreSQL services
- Implement read replicas for heavy read workloads
- Use connection pooling (PgBouncer)
- Monitor and adjust memory settings based on usage 