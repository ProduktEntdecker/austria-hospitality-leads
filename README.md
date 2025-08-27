# Austria Hospitality Leads - Hotel & Restaurant Outfitter Lead Generation System

## 🎯 Overview

Professional B2B lead generation system for Austrian hotel and restaurant interior design/outfitting market. Combines web scraping, AI-powered data enrichment, and manual validation to identify high-quality leads.

### Target Market
- Hotels (4-5 star) in Austria
- Restaurants (fine dining, boutique)
- Wellness & Spa facilities
- Event venues
- Mountain lodges & resorts

### Key Features
- Automated web scraping via N8N workflows
- Multi-AI validation (Claude, Perplexity, ChatGPT)
- GDPR-compliant data handling
- Lead scoring & qualification
- Manual review interface
- CRM integration ready

## 🚀 Quick Start

```bash
# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development servers
npm run dev

# Import N8N workflows
npm run n8n:import
```

## 📁 Project Structure

```
austria-hospitality-leads/
├── n8n-workflows/          # N8N automation workflows
│   ├── scraping/          # Web scraping workflows
│   ├── enrichment/        # Data enrichment workflows
│   └── validation/        # Lead validation workflows
├── backend/               # Node.js/Express API
│   ├── api/              # API endpoints
│   ├── services/         # Business logic
│   ├── models/           # Data models
│   └── controllers/      # Request handlers
├── frontend/             # React/Next.js interface
│   └── src/
│       ├── components/   # React components
│       ├── pages/        # Next.js pages
│       └── hooks/        # Custom React hooks
├── data/                 # Database & schemas
│   ├── schemas/          # Data schemas
│   ├── migrations/       # Database migrations
│   └── seeds/           # Sample data
├── scripts/              # Utility scripts
├── tests/               # Test suites
└── docs/                # Documentation
```

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js / Fastify
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: Bull/Redis for job processing
- **Cache**: Redis

### AI Integration
- **Claude API**: Company research & validation
- **Perplexity**: Real-time web search
- **ChatGPT**: Data extraction & enrichment
- **DeepSeek**: Cost-effective bulk processing

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **State**: Zustand/Redux Toolkit
- **Forms**: React Hook Form + Zod

### Automation
- **N8N**: Workflow automation
- **Puppeteer**: Advanced scraping
- **Playwright**: Browser automation

## 🏗️ Installation

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis
- N8N instance (local or cloud)

### Environment Setup

1. **Clone repository**
```bash
git clone https://github.com/yourusername/austria-hospitality-leads.git
cd austria-hospitality-leads
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Configure environment**
```bash
cp .env.example .env
# Add your API keys and configuration
```

4. **Database setup**
```bash
npm run db:setup
npm run db:migrate
npm run db:seed
```

5. **Start services**
```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

## 🔑 API Configuration

### Required API Keys
- `ANTHROPIC_API_KEY` - Claude API
- `OPENAI_API_KEY` - ChatGPT
- `PERPLEXITY_API_KEY` - Perplexity search
- `DEEPSEEK_API_KEY` - DeepSeek (optional)

### N8N Configuration
- `N8N_HOST` - N8N instance URL
- `N8N_API_KEY` - N8N API key
- `N8N_WEBHOOK_URL` - Webhook endpoint

## 📊 Data Schema

### Lead Model
```typescript
interface Lead {
  id: string;
  companyName: string;
  type: 'HOTEL' | 'RESTAURANT' | 'SPA' | 'VENUE';
  category: string; // e.g., '4-star', 'boutique', 'luxury'
  
  // Contact Information
  website: string;
  email: string;
  phone: string;
  
  // Location
  address: string;
  city: string;
  region: string; // e.g., 'Tirol', 'Wien'
  postalCode: string;
  
  // Business Details
  capacity: number; // rooms/seats
  lastRenovation: Date;
  yearEstablished: number;
  ownershipType: string;
  
  // Lead Scoring
  score: number; // 0-100
  qualificationStatus: 'NEW' | 'QUALIFIED' | 'CONTACTED' | 'OPPORTUNITY';
  renovationPlanned: boolean;
  budget: string;
  
  // Enrichment
  decisionMakers: Contact[];
  competitorInfo: string[];
  recentProjects: Project[];
  
  // Metadata
  source: string;
  createdAt: Date;
  updatedAt: Date;
  validatedAt: Date;
  gdprConsent: boolean;
}
```

## 🚦 API Endpoints

### Leads
- `GET /api/leads` - List all leads with filtering
- `GET /api/leads/:id` - Get lead details
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Enrichment
- `POST /api/enrich/:id` - Trigger AI enrichment
- `GET /api/enrich/status/:id` - Check enrichment status

### Validation
- `POST /api/validate/:id` - Manual validation
- `GET /api/validation/queue` - Get validation queue

### Export
- `GET /api/export/csv` - Export as CSV
- `GET /api/export/crm` - Export to CRM format

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm test
```

## 📈 Performance Metrics

### Target KPIs
- Lead identification: 500+ leads/month
- Validation accuracy: >95%
- Processing time: <30s per lead
- Manual review: <2 min per lead
- Cost per lead: <€0.50

## 🔒 Security & Compliance

### GDPR Compliance
- Data minimization principle
- Consent management
- Right to erasure
- Data portability
- Privacy by design

### Security Measures
- API rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- Encrypted data storage

## 🚀 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Cloud Deployment
- Backend: Railway/Render
- Frontend: Vercel
- Database: Supabase/Neon
- N8N: N8N Cloud

## 📝 License

Proprietary - All rights reserved

## 🤝 Support

- Email: support@yourdomain.at
- Documentation: `/docs`
- API Reference: `/docs/api`

## 🏆 Credits

Built with focus on the Austrian hospitality market by [Your Company]

---

**Version**: 1.0.0  
**Last Updated**: November 2024