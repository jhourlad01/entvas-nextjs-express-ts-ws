# Nginx Service

Nginx reverse proxy service for load balancing, SSL termination, and static file serving with enhanced security and configuration control.

## Features

- **Reverse Proxy**: Routes traffic to API and client services
- **SSL/TLS Termination**: HTTPS support with certificate management
- **Load Balancing**: Distributes traffic across multiple service instances
- **Static File Serving**: Serves static assets efficiently
- **Rate Limiting**: Built-in rate limiting for API protection
- **Caching**: Response caching for improved performance
- **Webhook Routing**: Direct routing for webhook endpoints with proper headers

## Architecture

- **Base Image**: Nginx Alpine
- **Enhanced Security**: Built-in security hardening and monitoring
- **SSL Support**: Built-in SSL certificate management
- **Health Checks**: Built-in health monitoring
- **Security Hardening**: Proper permissions and user setup

## Configuration Files

### `Dockerfile`
Production-ready Dockerfile with:
- Nginx Alpine base image
- Additional security packages (curl, openssl)
- Proper directory structure and SSL certificate handling
- Security-hardened file permissions
- Built-in health checks
- Dedicated nginx user for security isolation

### `nginx.conf`
Main nginx configuration with:
- **Reverse proxy** routing for API and client services
- **Rate limiting** for API protection
- **WebSocket support** for real-time connections
- **Gzip compression** for performance
- **Static file caching** for assets
- **Security headers** and SSL configuration

### SSL Configuration
SSL certificates should be placed in the `ssl/` directory:

```
ssl/
├── cert.pem          # SSL certificate
├── key.pem           # Private key
└── dhparam.pem       # Diffie-Hellman parameters (optional)
```

## Configuration

### Main Configuration
The main nginx configuration is in `nginx.conf`:

```nginx
# Main server block
server {
    listen 80;
    server_name localhost;
    
    # API routes
    location /api/ {
        proxy_pass http://api:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Webhook endpoint (direct to API)
    location /webhook {
        proxy_pass http://api:8000/webhook;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Client routes
    location / {
        proxy_pass http://client:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL Configuration
SSL certificates should be placed in the `ssl/` directory:

```
ssl/
├── cert.pem          # SSL certificate
├── key.pem           # Private key
└── dhparam.pem       # Diffie-Hellman parameters (optional)
```

### Webhook Endpoint Routing
The nginx configuration includes specific routing for webhook endpoints:

```nginx
# Webhook endpoint (direct to API)
location /webhook {
    proxy_pass http://api:8000/webhook;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

This configuration ensures:
- **Direct Routing**: Webhook requests go directly to the API service
- **Header Preservation**: All necessary headers are forwarded
- **IP Forwarding**: Client IP addresses are properly forwarded
- **Protocol Forwarding**: Original protocol information is preserved

## Setup

### SSL Certificates
1. Obtain SSL certificates from your certificate authority
2. Place certificates in `ssl/` directory
3. Update nginx configuration to use SSL

### Development Setup
```bash
# Start nginx service
docker-compose up -d nginx

# Check nginx logs
docker-compose logs nginx
```

### Production Setup
```bash
# Deploy nginx service
docker-compose -f docker-compose.yml up -d nginx

# Verify SSL configuration
docker-compose exec nginx nginx -t
```

## SSL Configuration

### Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt-get install certbot

# Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates to nginx ssl directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
```

### Self-Signed Certificate (Development)
```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem -out ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Entvas/CN=localhost"
```

## Load Balancing

### Multiple API Instances
```nginx
upstream api_backend {
    server api1:8000;
    server api2:8000;
    server api3:8000;
}

location /api/ {
    proxy_pass http://api_backend/;
}
```

### Health Checks
```nginx
upstream api_backend {
    server api1:8000 max_fails=3 fail_timeout=30s;
    server api2:8000 max_fails=3 fail_timeout=30s;
}
```

## Security

### Rate Limiting
```nginx
# Rate limiting for API endpoints
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://api:8000/;
}
```

### Security Headers
```nginx
# Add security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## Monitoring

### Logs
```bash
# View nginx logs
docker-compose logs nginx

# View access logs
docker-compose exec nginx tail -f /var/log/nginx/access.log

# View error logs
docker-compose exec nginx tail -f /var/log/nginx/error.log
```

### Health Checks
The service includes built-in health checks:
```bash
# Check service health
docker-compose ps nginx

# Test nginx configuration
docker-compose exec nginx nginx -t

# Check nginx status
docker-compose exec nginx nginx -s status
```

## Security Features

### Security Enhancements
- **Security Hardening**: Proper file permissions and user setup
- **SSL Certificate Management**: Built-in SSL certificate handling
- **Health Monitoring**: Built-in health checks with curl
- **Package Management**: Additional security packages (openssl)
- **User Isolation**: Dedicated nginx user for security
- **Logging**: Proper log directory setup and permissions

### Security Headers
```nginx
# Add security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## Performance

### Caching
```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Gzip Compression
```nginx
# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

## Troubleshooting

### Common Issues

#### SSL Certificate Errors
- Verify certificate files exist in `ssl/` directory
- Check certificate validity: `openssl x509 -in ssl/cert.pem -text -noout`
- Ensure proper file permissions

#### Connection Refused
- Verify API and client services are running
- Check service names in nginx configuration
- Verify network connectivity between containers

#### 502 Bad Gateway
- Check if upstream services are healthy
- Verify service ports are correct
- Check service logs for errors

### Debug Commands
```bash
# Test nginx configuration
docker-compose exec nginx nginx -t

# Reload nginx configuration
docker-compose exec nginx nginx -s reload

# Check nginx processes
docker-compose exec nginx ps aux | grep nginx

# Test upstream connectivity
docker-compose exec nginx curl -I http://api:8000/health
``` 