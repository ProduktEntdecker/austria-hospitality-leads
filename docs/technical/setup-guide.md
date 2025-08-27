# Technical Setup Guide - Austria Hospitality Leads

## Prerequisites

### System Requirements
- **Node.js**: 20.x or later
- **PostgreSQL**: 15.x or later
- **Redis**: 7.x or later
- **Docker**: 24.x or later (optional)
- **N8N**: Latest version

### API Keys Required
- **Anthropic Claude API**: For advanced lead research
- **OpenAI API**: For data extraction and enrichment
- **Perplexity API**: For real-time web search
- **DeepSeek API**: For cost-effective bulk processing (optional)

---

## Quick Start with Docker

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/austria-hospitality-leads.git
cd austria-hospitality-leads
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

### 3. Start Services
```bash
# Start all services
docker-compose up -d

# Or start with monitoring
docker-compose --profile monitoring up -d
```

### 4. Initialize Database
```bash
# Run database migrations
docker-compose exec backend npm run db:migrate

# Seed initial data
docker-compose exec backend npm run db:seed
```

### 5. Import N8N Workflows
```bash
# Import workflows
docker-compose exec backend npm run n8n:import
```

### 6. Access Services
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **N8N Interface**: http://localhost:5678
- **Grafana** (with monitoring): http://localhost:3030

---

## Manual Setup

### 1. Database Setup

#### PostgreSQL Installation (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE austria_leads;
CREATE USER austria_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE austria_leads TO austria_user;
```

#### Redis Installation
```bash
sudo apt install redis-server

# Configure Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with database credentials and API keys

# Generate Prisma client
npx prisma generate

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies  
npm install

# Configure environment
cp .env.example .env.local
# Edit with backend API URL

# Start development server
npm run dev
```

### 4. N8N Setup

#### Docker Installation (Recommended)
```bash
mkdir n8n-data
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e DB_TYPE=postgresdb \
  -e DB_POSTGRESDB_HOST=localhost \
  -e DB_POSTGRESDB_PORT=5432 \
  -e DB_POSTGRESDB_DATABASE=austria_leads_n8n \
  -e DB_POSTGRESDB_USER=austria_user \
  -e DB_POSTGRESDB_PASSWORD=secure_password \
  -v n8n-data:/home/node/.n8n \
  n8nio/n8n
```

#### Local Installation
```bash
npm install n8n -g

# Configure database
export DB_TYPE=postgresdb
export DB_POSTGRESDB_HOST=localhost
export DB_POSTGRESDB_PORT=5432
export DB_POSTGRESDB_DATABASE=austria_leads_n8n
export DB_POSTGRESDB_USER=austria_user
export DB_POSTGRESDB_PASSWORD=secure_password

# Start N8N
n8n start
```

---

## Configuration

### Environment Variables

#### Backend (.env)
```bash
# Application
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://austria_user:secure_password@localhost:5432/austria_leads
REDIS_URL=redis://localhost:6379

# AI APIs
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
DEEPSEEK_API_KEY=sk-...

# N8N Integration
N8N_HOST=http://localhost:5678
N8N_API_KEY=your-n8n-api-key
N8N_WEBHOOK_URL=http://localhost:3001/api/webhooks/n8n

# Security
JWT_SECRET=your-jwt-secret-here
ENCRYPTION_KEY=your-32-character-encryption-key
SESSION_SECRET=your-session-secret-here

# Features
ENABLE_AI_ENRICHMENT=true
ENABLE_AUTO_VALIDATION=true
ENABLE_LEAD_SCORING=true
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Austria Hospitality Leads
```

### Database Schema

#### Run Migrations
```bash
cd backend
npx prisma migrate dev --name initial
```

#### Reset Database (if needed)
```bash
npx prisma migrate reset
```

---

## N8N Workflow Setup

### 1. Import Workflows
```bash
# From project root
npm run n8n:import
```

### 2. Configure Credentials in N8N UI

#### API Keys
- Go to Settings > Credentials
- Add credentials for:
  - **Anthropic API**: API key
  - **OpenAI API**: API key  
  - **Perplexity API**: API key
  - **HTTP Auth**: For backend webhooks

#### Database Connection
- Add PostgreSQL credentials for data storage

#### Webhook URLs
- Configure webhook URLs in each workflow:
  - Scraping: `http://localhost:3001/api/webhooks/n8n/scraping`
  - Enrichment: `http://localhost:3001/api/webhooks/n8n/enrichment`
  - Validation: `http://localhost:3001/api/webhooks/n8n/validation`

### 3. Schedule Workflows

#### Daily Scraping (6 AM CET)
```javascript
// Cron expression: 0 6 * * *
// Workflow: hotel-directory-scraper
```

#### Weekly Enrichment (Sunday 2 AM CET)  
```javascript
// Cron expression: 0 2 * * 0
// Workflow: bulk-ai-enrichment
```

---

## Testing

### Unit Tests
```bash
# Backend
cd backend && npm test

# Frontend  
cd frontend && npm test
```

### Integration Tests
```bash
# Full integration test suite
npm run test:integration
```

### E2E Tests
```bash
# End-to-end testing with Playwright
npm run test:e2e
```

---

## Monitoring & Logging

### Application Logs
```bash
# View backend logs
docker-compose logs -f backend

# View N8N logs
docker-compose logs -f n8n
```

### Health Checks
- **Backend**: `GET http://localhost:3001/health`
- **Frontend**: `GET http://localhost:3000`
- **N8N**: `GET http://localhost:5678/healthz`

### Prometheus Metrics
```bash
# Start with monitoring
docker-compose --profile monitoring up -d

# Access metrics
curl http://localhost:9090/metrics
```

### Grafana Dashboard
- URL: http://localhost:3030
- Default credentials: admin/admin
- Pre-configured dashboards for lead metrics

---

## Performance Optimization

### Database Indexes
```sql
-- Essential indexes are included in Prisma schema
-- Additional custom indexes:
CREATE INDEX idx_leads_compound ON leads(type, region, status);
CREATE INDEX idx_leads_score_created ON leads(score DESC, created_at DESC);
```

### Redis Caching
```bash
# Configure Redis for caching
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password
```

### Rate Limiting
```javascript
// Configured in backend/middleware/rateLimiter.js
// 100 requests per minute per IP
// 1000 requests per hour per API key
```

---

## Security

### HTTPS Configuration
```bash
# Production deployment with SSL
# Configure reverse proxy (nginx/traefik) with SSL certificates
```

### API Authentication
```bash
# JWT tokens with 24-hour expiration
# Refresh token mechanism implemented
```

### Data Encryption
```bash
# Sensitive data encrypted at rest
# API keys stored in environment variables
# Database credentials in secure storage
```

### GDPR Compliance
- Data retention policies configured
- Consent management implemented
- Right to erasure functionality
- Data export capabilities

---

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Verify connection
psql -h localhost -U austria_user -d austria_leads
```

#### API Key Issues
```bash
# Verify API keys in environment
echo $ANTHROPIC_API_KEY

# Test API connection
curl -H "x-api-key: $ANTHROPIC_API_KEY" https://api.anthropic.com/v1/messages
```

#### N8N Workflow Failures
```bash
# Check N8N logs
docker-compose logs n8n

# Verify webhook endpoints
curl -X POST http://localhost:3001/api/webhooks/n8n/test
```

#### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check database performance
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

### Log Analysis
```bash
# Search application logs
grep -i "error" logs/app.log

# Monitor real-time logs
tail -f logs/app.log | grep -i "ai\|enrichment"
```

### Database Debugging
```bash
# Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

# Monitor active connections
SELECT count(*) FROM pg_stat_activity;
```

---

## Backup & Recovery

### Database Backup
```bash
# Automated daily backup
pg_dump -h localhost -U austria_user austria_leads > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h localhost -U austria_user austria_leads < backup_20241120.sql
```

### N8N Workflow Backup
```bash
# Export workflows
npm run n8n:export

# Backup to version control
git add n8n-workflows/exports/
git commit -m "Backup N8N workflows"
```

---

## Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations completed
- [ ] N8N workflows imported
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] GDPR compliance verified

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
```

---

## Support

### Getting Help
- **Documentation**: `/docs` folder
- **API Reference**: `/docs/api/endpoints.md`
- **Issues**: GitHub Issues
- **Email**: support@yourdomain.at

### Community
- **Discord**: Link to Discord server
- **Forum**: Link to community forum