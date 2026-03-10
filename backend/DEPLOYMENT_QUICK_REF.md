# Deployment Quick Reference

Quick commands and configurations for common deployment scenarios.

## Quick Commands

### Local Development
```bash
# Install and start
npm install
npm run dev

# Health check
curl http://localhost:3000/api/health
```

### Production (PM2)
```bash
# Start
pm2 start pm2.config.js
pm2 save

# Monitor
pm2 logs wechat-shop
pm2 monit

# Restart
pm2 restart wechat-shop
```

### Docker
```bash
# Start
docker-compose up -d

# Logs
docker-compose logs -f api

# Restart
docker-compose restart api
```

## Environment Variables Template

```bash
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wechat_shop
DB_USER=shopuser
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
UPLOAD_PATH=./uploads/products
MAX_FILE_SIZE=2097152
LOG_LEVEL=info
LOG_PATH=./logs
WECHAT_APPID=wx06e38f82f0bafd80
WECHAT_SECRET=your-wechat-secret
```

## Database Backup

```bash
# Backup
mysqldump -u shopuser -p wechat_shop | gzip > backup.sql.gz

# Restore
gunzip < backup.sql.gz | mysql -u shopuser -p wechat_shop
```

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

## SSL Certificate

```bash
# Install
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

## Troubleshooting

```bash
# Check port
lsof -i :3000

# Check PM2
pm2 status

# Check Docker
docker-compose ps

# View logs
tail -f logs/combined.log
```
