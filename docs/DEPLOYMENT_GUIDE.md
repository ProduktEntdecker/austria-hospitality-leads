# Deployment Guide - Austria Hospitality Outfitters

## 🚀 Production Deployment

This guide covers deploying the Austrian hospitality outfitters B2B discovery system to production.

## Prerequisites

### Required Services
- **Server**: VPS with 4GB+ RAM, 20GB+ storage
- **Database**: PostgreSQL 15+ instance
- **Redis**: Redis 7+ instance  
- **Domain**: SSL-enabled domain name
- **N8N**: N8N Cloud or self-hosted instance

### Required API Keys
- **Anthropic Claude API** ($20/month budget recommended)
- **OpenAI API** ($30/month budget recommended)  
- **Perplexity API** ($20/month budget recommended)
- **DeepSeek API** (Optional, $10/month)

## Quick Deploy Options

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/ProduktEntdecker/austria-hospitality-leads.git
cd austria-hospitality-leads

# Configure production environment
cp .env.example .env.production
# Edit with production values

# Deploy with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Railway/Render Deployment

```bash
# Connect to Railway
railway login
railway link [project-id]

# Set environment variables
railway variables set ANTHROPIC_API_KEY=your-key
railway variables set OPENAI_API_KEY=your-key
railway variables set PERPLEXITY_API_KEY=your-key
railway variables set DATABASE_URL=postgresql://...

# Deploy
git push origin main
```

### Option 3: Manual Server Setup

#### 1. Server Setup (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker & Docker Compose
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker $USER

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Redis
sudo apt install redis-server -y

# Install Nginx
sudo apt install nginx -y
```

#### 2. Database Setup

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE austria_leads;
CREATE USER austria_user WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE austria_leads TO austria_user;
\q
```

#### 3. Application Setup

```bash
# Clone and setup
git clone https://github.com/ProduktEntdecker/austria-hospitality-leads.git
cd austria-hospitality-leads

# Install dependencies
npm run install:all

# Setup environment
cp .env.example .env
# Edit with production settings

# Build applications
npm run build

# Setup database
cd backend && npm run db:migrate && npm run db:seed
```

#### 4. Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start applications
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 5. Nginx Configuration

```nginx
# /etc/nginx/sites-available/austria-leads
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/austria-leads /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## N8N Setup

### N8N Cloud Setup

1. Create account at [n8n.cloud](https://n8n.cloud)
2. Import workflows from `/n8n-workflows/`
3. Configure credentials:
   - Backend API credentials
   - Database connection
   - Webhook URLs

### Self-hosted N8N

```bash
# Docker deployment
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e DB_TYPE=postgresdb \
  -e DB_POSTGRESDB_HOST=localhost \
  -e DB_POSTGRESDB_PORT=5432 \
  -e DB_POSTGRESDB_DATABASE=austria_leads_n8n \
  -e DB_POSTGRESDB_USER=austria_user \
  -e DB_POSTGRESDB_PASSWORD=secure_password_here \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n
```

## Production Environment Variables

### Backend (.env)

```bash
# Application
NODE_ENV=production
PORT=3001
API_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://austria_user:password@localhost:5432/austria_leads
DATABASE_SSL=true
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=redis_production_password

# AI APIs
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
DEEPSEEK_API_KEY=sk-...

# N8N Integration
N8N_HOST=https://your-n8n-instance.com
N8N_API_KEY=your-n8n-api-key
N8N_WEBHOOK_URL=https://your-domain.com/api/webhooks/n8n

# Security
JWT_SECRET=production-jwt-secret-32-chars-min
ENCRYPTION_KEY=production-encryption-key-32-chars
SESSION_SECRET=production-session-secret

# Features
ENABLE_AI_ENRICHMENT=true
ENABLE_AUTO_VALIDATION=true
ENABLE_LEAD_SCORING=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Austria Hospitality Outfitters
```

## Monitoring Setup

### 1. Application Monitoring

```bash
# PM2 Monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# System monitoring
sudo apt install htop iotop -y
```

### 2. Database Monitoring

```sql
-- PostgreSQL monitoring queries
SELECT * FROM pg_stat_activity WHERE state = 'active';
SELECT schemaname,tablename,n_tup_ins,n_tup_upd,n_tup_del FROM pg_stat_user_tables;
```

### 3. Log Management

```bash
# Setup logrotate for application logs
sudo nano /etc/logrotate.d/austria-leads

# Content:
/home/user/austria-hospitality-leads/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
```

## Security Hardening

### 1. Firewall Setup

```bash
# UFW firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. SSH Hardening

```bash
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 2222  # Change default port
```

### 3. Application Security

```bash
# Set proper file permissions
chmod 600 .env
chmod 755 -R logs/
chown -R app:app /opt/austria-leads/
```

## Backup Strategy

### 1. Database Backup

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump -h localhost -U austria_user austria_leads > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### 2. Application Backup

```bash
# Backup application files
tar -czf /backups/app_$(date +%Y%m%d).tar.gz /opt/austria-leads/ --exclude=node_modules

# Backup N8N workflows  
npm run n8n:export
cp -r n8n-workflows/exports/ /backups/n8n/
```

## Performance Optimization

### 1. Database Optimization

```sql
-- PostgreSQL optimization
ALTER DATABASE austria_leads SET work_mem = '256MB';
ALTER DATABASE austria_leads SET maintenance_work_mem = '512MB';
ALTER DATABASE austria_leads SET checkpoint_completion_target = 0.9;
```

### 2. Redis Configuration

```bash
# redis.conf optimizations
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 3. Node.js Optimization

```bash
# PM2 configuration
module.exports = {
  apps: [{
    name: 'austria-leads-backend',
    script: './backend/dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}
```

## Health Checks

### 1. Application Health

```bash
#!/bin/bash
# healthcheck.sh

# Backend health
curl -f http://localhost:3001/health || exit 1

# Frontend health  
curl -f http://localhost:3000 || exit 1

# Database health
pg_isready -h localhost -U austria_user || exit 1

# Redis health
redis-cli ping || exit 1
```

### 2. Automated Monitoring

```bash
# Add to crontab
*/5 * * * * /opt/austria-leads/healthcheck.sh || /opt/austria-leads/alert.sh
0 2 * * * /opt/austria-leads/backup.sh
```

## Troubleshooting

### Common Issues

1. **High Memory Usage**: Increase server resources or optimize queries
2. **API Rate Limits**: Implement exponential backoff, increase delays
3. **Database Locks**: Monitor long-running queries, optimize indexes
4. **N8N Connection Issues**: Check webhook URLs, verify credentials

### Useful Commands

```bash
# Check application logs
pm2 logs austria-leads-backend

# Database connections
SELECT count(*) FROM pg_stat_activity;

# Redis memory usage
redis-cli info memory

# System resources
htop
df -h
free -h
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (nginx/haproxy)
- Multiple backend instances
- Database read replicas
- Redis cluster

### Vertical Scaling
- Increase server resources
- Optimize database configuration
- Implement caching layers

---

**Deployment Checklist:**
- [ ] Server provisioned and hardened
- [ ] Database setup and optimized
- [ ] Application deployed and running
- [ ] N8N workflows imported and configured
- [ ] SSL certificates installed
- [ ] Monitoring and alerting configured
- [ ] Backup strategy implemented
- [ ] Health checks running
- [ ] Performance optimization applied
- [ ] Security hardening completed

**Support**: For deployment assistance, refer to technical documentation or contact the development team.