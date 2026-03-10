# Backend Deployment Guide

Complete deployment guide for the WeChat Mini Program Backend API.

## Table of Contents

1. [Local Development Deployment](#local-development-deployment)
2. [Production Deployment (VPS/Cloud)](#production-deployment-vpscloud)
3. [Docker Deployment](#docker-deployment)
4. [Mini Program Configuration](#mini-program-configuration)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Troubleshooting](#troubleshooting)

---

## Local Development Deployment

### Prerequisites

- Node.js >= 22.x
- MySQL >= 8.0
- npm or yarn package manager
- Git

### Step-by-step Guide

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wechat_shop
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_change_this
JWT_EXPIRES_IN=24h
UPLOAD_PATH=./uploads/products
MAX_FILE_SIZE=2097152
LOG_LEVEL=debug
LOG_PATH=./logs
WECHAT_APPID=wx06e38f82f0bafd80
WECHAT_SECRET=your-wechat-secret
```

#### 4. Setup Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE wechat_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user (optional)
CREATE USER 'shopuser'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON wechat_shop.* TO 'shopuser'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

#### 5. Initialize Database

```bash
# Import schema (if you have a schema file)
mysql -u root -p wechat_shop < database/schema.sql
```

#### 6. Start Development Server

```bash
# Start with Node.js
npm run dev

# Or start with PM2
pm2 start pm2.config.js
```

#### 7. Verify Installation

```bash
# Health check
curl http://localhost:3000/api/health

# Expected response
{"status":"ok","timestamp":"2025-01-01T00:00:00.000Z"}
```

---

## Production Deployment (VPS/Cloud)

### Server Requirements

**Minimum Specifications:**
- CPU: 2 cores
- RAM: 2GB
- Storage: 20GB SSD
- OS: Ubuntu 22.04 LTS or CentOS 8+

**Recommended Specifications:**
- CPU: 4 cores
- RAM: 4GB
- Storage: 40GB SSD
- OS: Ubuntu 22.04 LTS

### Step-by-step Installation

#### 1. Server Initial Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Create deployment user
sudo adduser deploy
sudo usermod -aG sudo deploy

# Switch to deploy user
su - deploy
```

#### 2. Install Node.js 22.x

```bash
# Install Node.js using NVM (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
nvm alias default 22

# Verify installation
node -v
npm -v
```

#### 3. Install MySQL 8.0

```bash
# Install MySQL
sudo apt install mysql-server -y

# Secure MySQL installation
sudo mysql_secure_installation

# Login to MySQL
sudo mysql

# Create database and user
CREATE DATABASE wechat_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'shopuser'@'localhost' IDENTIFIED BY 'strong_secure_password';
GRANT ALL PRIVILEGES ON wechat_shop.* TO 'shopuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 4. Install Nginx

```bash
# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Allow HTTP traffic
sudo ufw allow 'Nginx Full'
```

#### 5. Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 to start on boot
pm2 startup systemd
# Follow the instructions and run the generated command
```

#### 6. Clone and Setup Application

```bash
# Clone repository
cd ~
git clone <repository-url> backend
cd backend

# Install dependencies
npm ci --only=production

# Create necessary directories
mkdir -p uploads/products
mkdir -p logs

# Setup environment variables
cp .env.example .env
nano .env
# Update with production values
```

**Production .env Configuration:**

```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wechat_shop
DB_USER=shopuser
DB_PASSWORD=strong_secure_password
JWT_SECRET=very_long_random_jwt_secret_change_this_in_production
JWT_EXPIRES_IN=24h
UPLOAD_PATH=./uploads/products
MAX_FILE_SIZE=2097152
LOG_LEVEL=info
LOG_PATH=./logs
WECHAT_APPID=wx06e38f82f0bafd80
WECHAT_SECRET=your-production-wechat-secret
```

#### 7. Start Application with PM2

```bash
# Start application
pm2 start pm2.config.js

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs wechat-shop
```

#### 8. Configure Nginx Reverse Proxy

Create Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/wechat-shop
```

Add the following configuration:

```nginx
# HTTP Configuration - Redirect to HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration (see SSL Setup section below)
    # ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/wechat-shop-access.log;
    error_log /var/log/nginx/wechat-shop-error.log;

    # Proxy configuration
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # File upload size limit
    client_max_body_size 2M;
}
```

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/wechat-shop /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### 9. SSL Setup with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run

# Certbot will automatically set up cron job for renewal
```

#### 10. Setup Firewall

```bash
# Configure UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## Docker Deployment

### Prerequisites

- Docker >= 20.10
- Docker Compose >= 2.0

### Build and Run with Docker Compose

#### 1. Prepare Environment File

Create `.env` file in the backend directory:

```env
NODE_ENV=production
PORT=3000
DB_HOST=db
DB_PORT=3306
DB_NAME=wechat_shop
DB_USER=root
DB_PASSWORD=your_secure_docker_password
JWT_SECRET=your_jwt_secret_change_this
JWT_EXPIRES_IN=24h
UPLOAD_PATH=./uploads/products
MAX_FILE_SIZE=2097152
LOG_LEVEL=info
LOG_PATH=./logs
WECHAT_APPID=wx06e38f82f0bafd80
WECHAT_SECRET=your-wechat-secret
```

#### 2. Build and Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

#### 3. Initialize Database

```bash
# Access MySQL container
docker-compose exec db mysql -uroot -p

# Create database (if not auto-created)
CREATE DATABASE wechat_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### 4. Stop and Remove Services

```bash
# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v
```

#### 5. Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

---

## Mini Program Configuration

### Local Testing

1. **Enable Local Network** in WeChat Developer Tools:
   - Open WeChat Developer Tools
   - Go to Details → Local Settings
   - Check "不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"

2. **Set API Base URL**:
   ```
   http://localhost:3000/api
   http://192.168.x.x:3000/api  # Use your local IP for device testing
   ```

### Production Domain Setup

1. **Configure Server Domain** in WeChat Mini Program Backend:
   - Login to [WeChat Mini Program Admin](https://mp.weixin.qq.com/)
   - Go to Development → Development Settings → Server Domain
   - Add your API domain: `https://api.yourdomain.com`

2. **Requirements**:
   - Domain must use HTTPS
   - Valid SSL certificate (Let's Encrypt is acceptable)
   - Domain must be ICP registered (for China deployment)

3. **WebSocket Domain** (if using):
   ```
   wss://api.yourdomain.com
   ```

4. **Upload File Domain** (if using):
   ```
   https://api.yourdomain.com
   ```

---

## Monitoring & Maintenance

### View Logs

#### PM2 Logs

```bash
# View all logs
pm2 logs wechat-shop

# View logs in real-time
pm2 logs wechat-shop --lines 100

# View only errors
pm2 logs wechat-shop --err

# Clear logs
pm2 flush
```

#### Docker Logs

```bash
# View API logs
docker-compose logs api

# View database logs
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f api
```

#### Application Logs

```bash
# View application log files
tail -f logs/combined.log
tail -f logs/error.log
tail -f logs/access.log
```

### Monitor Performance

#### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View detailed metrics
pm2 show wechat-shop

# View all processes
pm2 list
```

#### System Resources

```bash
# CPU and memory usage
htop

# Disk usage
df -h

# Process monitoring
ps aux | grep node
```

#### Database Monitoring

```bash
# MySQL status
sudo systemctl status mysql

# MySQL connections
mysql -u shopuser -p -e "SHOW PROCESSLIST;"

# Database size
mysql -u shopuser -p -e "
SELECT
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'wechat_shop'
GROUP BY table_schema;"
```

### Restart Service

#### PM2 Restart

```bash
# Restart application
pm2 restart wechat-shop

# Reload with zero-downtime
pm2 reload wechat-shop

# Stop and start
pm2 stop wechat-shop
pm2 start wechat-shop
```

#### Docker Restart

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart api
```

### Database Backup

#### Manual Backup

```bash
# Backup database
mysqldump -u shopuser -p wechat_shop > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup with compression
mysqldump -u shopuser -p wechat_shop | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### Automated Backup Script

Create backup script `/home/deploy/backup.sh`:

```bash
#!/bin/bash
# Database Backup Script
# Usage: ./backup.sh

# Configuration
BACKUP_DIR="/home/deploy/backups"
DB_NAME="wechat_shop"
DB_USER="shopuser"
DB_PASSWORD="your_secure_password"
RETENTION_DAYS=7

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Generate backup filename with timestamp
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/shop_$DATE.sql.gz"

# Perform backup
echo "Starting backup: $DATE"
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"

    # Calculate backup size
    SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo "Backup size: $SIZE"
else
    echo "Backup failed!"
    exit 1
fi

# Remove old backups (older than RETENTION_DAYS)
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "shop_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup process completed."
```

Make the script executable:

```bash
chmod +x /home/deploy/backup.sh
```

Setup cron job for automatic backups:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/deploy/backup.sh >> /home/deploy/backup.log 2>&1
```

#### Restore Database

```bash
# Restore from SQL file
gunzip < backup_20250101_020000.sql.gz | mysql -u shopuser -p wechat_shop

# Or without compression
mysql -u shopuser -p wechat_shop < backup_20250101_020000.sql
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000
# or
netstat -tulpn | grep :3000

# Kill the process
kill -9 <PID>

# Or use PM2 to stop the app
pm2 stop wechat-shop
```

#### 2. Database Connection Failed

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solution:**
```bash
# Check MySQL is running
sudo systemctl status mysql

# Start MySQL if not running
sudo systemctl start mysql

# Check MySQL credentials
mysql -u shopuser -p wechat_shop

# Check .env configuration
cat .env | grep DB_
```

#### 3. Permission Denied on Uploads Directory

**Error:** `EACCES: permission denied, mkdir './uploads/products'`

**Solution:**
```bash
# Create directory with proper permissions
mkdir -p uploads/products
chmod 755 uploads/products

# If running with PM2, ensure correct ownership
sudo chown -R deploy:deploy uploads/

# For Docker, check volume permissions
docker-compose exec api ls -la uploads/
```

#### 4. JWT Secret Not Configured

**Error:** `JWT_SECRET is not configured`

**Solution:**
```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env file
nano .env
# Add: JWT_SECRET=<generated-secret>

# Restart application
pm2 restart wechat-shop
```

#### 5. Nginx 502 Bad Gateway

**Error:** `nginx 502 bad gateway`

**Solution:**
```bash
# Check if Node.js application is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify application is listening on port 3000
netstat -tulpn | grep :3000

# Restart Nginx
sudo systemctl restart nginx

# Restart application
pm2 restart wechat-shop
```

#### 6. Docker Container Won't Start

**Error:** Docker container exits immediately

**Solution:**
```bash
# View container logs
docker-compose logs api

# Check for errors in logs
docker-compose logs --tail=50 api

# Rebuild container
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check Docker volumes
docker volume ls
docker volume inspect backend_mysql_data
```

#### 7. Out of Memory

**Error:** `JavaScript heap out of memory`

**Solution:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=2048"

# Update PM2 configuration
nano pm2.config.js
# Add: max_memory_restart: '1G'

# Restart with new configuration
pm2 restart wechat-shop

# Or add to package.json scripts
# "start": "node --max-old-space-size=2048 src/app.js"
```

#### 8. WeChat API Login Failed

**Error:** WeChat login returns error

**Solution:**
```bash
# Verify WeChat credentials
cat .env | grep WECHAT_

# Check WeChat AppID and Secret are correct
# Verify in WeChat Mini Program Admin Console

# Test WeChat API manually
curl "https://api.weixin.qq.com/sns/jscode2session?appid=wx06e38f82f0bafd80&secret=YOUR_SECRET&js_code=TEST_CODE&grant_type=authorization_code"

# Check application logs for detailed error
pm2 logs wechat-shop --lines 50
```

#### 9. Slow API Performance

**Diagnosis:**
```bash
# Check CPU usage
pm2 monit

# Check database query performance
mysql -u shopuser -p wechat_shop -e "SHOW PROCESSLIST;"

# Check slow query log
sudo tail -f /var/log/mysql/slow-query.log

# Enable slow query log if not enabled
mysql -u root -p -e "
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;"
```

**Solution:**
- Add database indexes
- Optimize database queries
- Enable Redis caching
- Scale horizontally with multiple PM2 instances

#### 10. File Upload Exceeds Size Limit

**Error:** `File too large`

**Solution:**
```bash
# Check application MAX_FILE_SIZE in .env
cat .env | grep MAX_FILE_SIZE

# Update Nginx client_max_body_size
sudo nano /etc/nginx/sites-available/wechat-shop
# Set: client_max_body_size 2M;

# Reload Nginx
sudo systemctl reload nginx

# Restart application
pm2 restart wechat-shop
```

### Debug Mode

Enable detailed logging:

```bash
# Update .env
nano .env
# Set: LOG_LEVEL=debug

# Restart application
pm2 restart wechat-shop

# View detailed logs
pm2 logs wechat-shop --lines 200
```

### Health Check Endpoint

Always available at `/api/health`:

```bash
curl http://localhost:3000/api/health

# Expected response
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "database": "connected",
  "memory": {
    "used": "50MB",
    "total": "512MB"
  }
}
```

### Getting Help

If you encounter issues not covered here:

1. Check application logs: `pm2 logs wechat-shop`
2. Check system logs: `journalctl -xe`
3. Check database logs: `sudo tail -f /var/log/mysql/error.log`
4. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
5. Review troubleshooting documentation
6. Contact support with logs and error messages

---

## Security Best Practices

1. **Always use strong passwords** for database and JWT secrets
2. **Keep dependencies updated**: `npm audit fix` regularly
3. **Use HTTPS** in production with valid SSL certificates
4. **Enable firewall** and only expose necessary ports
5. **Regular backups** with automated scripts
6. **Monitor logs** for suspicious activity
7. **Limit API rate** to prevent abuse
8. **Use environment variables** for sensitive data
9. **Never commit .env files** to version control
10. **Keep system updated**: `sudo apt update && sudo apt upgrade`

---

## Additional Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [WeChat Mini Program Documentation](https://developers.weixin.qq.com/miniprogram/dev/framework/)

---

**Last Updated:** 2025-01-01
**Version:** 1.0.0
