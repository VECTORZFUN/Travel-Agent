# TravelAI Deployment Guide

## Quick Start Production Deployment

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Domain name
- SSL certificate

### 2. Environment Setup

```bash
# Clone repository
git clone <your-repo>
cd travelai

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with production values
nano .env

# Frontend setup
cd ../frontend
npm install
```

### 3. Database Setup

```bash
# PostgreSQL
psql -U postgres
CREATE DATABASE travelai;
CREATE USER travelai_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE travelai TO travelai_user;

# Run migrations
npm run migrate
```

### 4. Deployment Options

#### Option A: Vercel (Frontend) + Heroku (Backend)

**Frontend on Vercel:**
```bash
cd frontend
vercel --prod
```

**Backend on Heroku:**
```bash
cd backend
heroku create travelai-api
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev
heroku config:set ANTHROPIC_API_KEY=your_key
# ... set other env vars
git push heroku main
```

#### Option B: AWS EC2

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install dependencies
sudo apt update
sudo apt install nodejs npm postgresql redis-server nginx

# Clone and setup
git clone <your-repo>
cd travelai/backend
npm install --production

# Setup PM2 for process management
npm install -g pm2
pm2 start server.js --name travelai-api
pm2 save
pm2 startup

# Nginx configuration
sudo nano /etc/nginx/sites-available/travelai
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name api.travelai.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Option C: Docker Deployment

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env
    depends_on:
      - postgres
      - redis
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://backend:3001
    restart: always

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=travelai
      - POSTGRES_USER=travelai_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: always

volumes:
  postgres_data:
  redis_data:
```

Deploy:
```bash
docker-compose up -d
```

### 5. SSL Setup (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d travelai.com -d www.travelai.com -d api.travelai.com
```

### 6. Monitoring & Logging

**Setup Sentry:**
```bash
npm install @sentry/node
```

**In server.js:**
```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

**Setup logging:**
```bash
npm install winston
```

### 7. CI/CD with GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
      
      - name: Run tests
        run: |
          cd backend
          npm test
      
      - name: Deploy to production
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
        run: |
          # Your deployment script here
```

### 8. Performance Optimization

**Enable caching:**
```javascript
// In server.js
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});

// Cache middleware
const cache = (duration) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.originalJson = res.json;
    res.json = (data) => {
      client.setEx(key, duration, JSON.stringify(data));
      res.originalJson(data);
    };
    next();
  };
};

// Use on routes
app.get('/api/flights/search', cache(300), flightsController);
```

**Enable compression:**
```javascript
const compression = require('compression');
app.use(compression());
```

### 9. Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] SQL injection protection
- [ ] XSS protection headers
- [ ] API authentication (JWT)
- [ ] Input validation
- [ ] File upload restrictions
- [ ] Database backups configured
- [ ] Secrets rotation policy
- [ ] DDoS protection (Cloudflare)

### 10. Backup Strategy

**Automated PostgreSQL backups:**
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U travelai_user travelai > $BACKUP_DIR/travelai_$DATE.sql
find $BACKUP_DIR -mtime +7 -delete
```

**Cron job:**
```bash
0 2 * * * /path/to/backup.sh
```

### 11. Scaling Considerations

**Horizontal Scaling:**
- Use load balancer (AWS ELB, Nginx)
- Stateless backend architecture
- Session storage in Redis
- Separate database server

**Vertical Scaling:**
- Upgrade server resources
- Optimize database queries
- Use database indexes
- Enable query caching

### 12. Monitoring Endpoints

```javascript
// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Metrics
app.get('/metrics', (req, res) => {
  res.json({
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  });
});
```

### 13. Post-Deployment

1. Test all endpoints
2. Verify API integrations
3. Test payment processing
4. Check email notifications
5. Monitor error rates
6. Test mobile responsiveness
7. Run security scan
8. Load testing

### 14. Troubleshooting

**Common Issues:**

1. **502 Bad Gateway**: Backend not running or wrong port
   ```bash
   pm2 status
   pm2 logs travelai-api
   ```

2. **CORS errors**: Check FRONTEND_URL in env
3. **Database connection**: Verify DATABASE_URL
4. **Rate limiting**: Adjust limits in production

### Support

For deployment issues:
- GitHub Issues: [link]
- Email: devops@travelai.com
- Docs: https://docs.travelai.com