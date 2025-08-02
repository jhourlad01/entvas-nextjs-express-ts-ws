# Use PostgreSQL 15 Alpine as base image
FROM postgres:15-alpine

# Set environment variables
ENV POSTGRES_DB=entvas_db
ENV POSTGRES_USER=entvas_user
ENV POSTGRES_PASSWORD=entvas_password

# Copy initialization scripts
COPY init-db.sql /docker-entrypoint-initdb.d/
COPY postgresql.conf /etc/postgresql/postgresql.conf

# Create custom PostgreSQL configuration
RUN echo "max_connections = 100" >> /etc/postgresql/postgresql.conf && \
    echo "shared_buffers = 256MB" >> /etc/postgresql/postgresql.conf && \
    echo "effective_cache_size = 1GB" >> /etc/postgresql/postgresql.conf && \
    echo "maintenance_work_mem = 64MB" >> /etc/postgresql/postgresql.conf && \
    echo "checkpoint_completion_target = 0.9" >> /etc/postgresql/postgresql.conf && \
    echo "wal_buffers = 16MB" >> /etc/postgresql/postgresql.conf && \
    echo "default_statistics_target = 100" >> /etc/postgresql/postgresql.conf && \
    echo "random_page_cost = 1.1" >> /etc/postgresql/postgresql.conf && \
    echo "effective_io_concurrency = 200" >> /etc/postgresql/postgresql.conf && \
    echo "work_mem = 4MB" >> /etc/postgresql/postgresql.conf && \
    echo "min_wal_size = 1GB" >> /etc/postgresql/postgresql.conf && \
    echo "max_wal_size = 4GB" >> /etc/postgresql/postgresql.conf && \
    echo "max_worker_processes = 2" >> /etc/postgresql/postgresql.conf && \
    echo "max_parallel_workers_per_gather = 1" >> /etc/postgresql/postgresql.conf && \
    echo "max_parallel_workers = 2" >> /etc/postgresql/postgresql.conf && \
    echo "max_parallel_maintenance_workers = 1" >> /etc/postgresql/postgresql.conf

# Create directory for custom configurations
RUN mkdir -p /etc/postgresql/custom

# Copy custom configuration files
COPY postgresql.conf /etc/postgresql/custom/
COPY pg_hba.conf /etc/postgresql/custom/

# Set proper permissions
RUN chown -R postgres:postgres /etc/postgresql/custom && \
    chmod 600 /etc/postgresql/custom/pg_hba.conf

# Expose PostgreSQL port
EXPOSE 5432

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD pg_isready -U entvas_user -d entvas_db || exit 1

# Use custom configuration
CMD ["postgres", "-c", "config_file=/etc/postgresql/custom/postgresql.conf"] 