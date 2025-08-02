# Use Nginx Alpine as base image
FROM nginx:alpine

# Install additional packages for security and monitoring
RUN apk add --no-cache \
    curl \
    openssl \
    && rm -rf /var/cache/apk/*

# Create necessary directories
RUN mkdir -p /var/log/nginx \
    && mkdir -p /etc/nginx/ssl \
    && mkdir -p /etc/nginx/custom

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates (if they exist)
COPY ssl/ /etc/nginx/ssl/

# Create custom configuration directory
RUN mkdir -p /etc/nginx/custom

# Copy custom configurations
COPY nginx.conf /etc/nginx/custom/
COPY ssl/ /etc/nginx/custom/ssl/

# Set proper permissions
RUN chown -R nginx:nginx /var/log/nginx \
    && chmod -R 755 /var/log/nginx \
    && chmod 644 /etc/nginx/nginx.conf \
    && chmod 600 /etc/nginx/ssl/*.key 2>/dev/null || true \
    && chmod 644 /etc/nginx/ssl/*.crt 2>/dev/null || true

# Nginx user already exists in Alpine image, no need to create

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 