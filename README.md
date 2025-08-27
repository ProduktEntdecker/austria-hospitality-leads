# Austria Hospitality Outfitters - B2B Service Provider Discovery System

## 🎯 Overview

Professional B2B discovery system for Austrian hospitality outfitting companies. Identifies and enriches data about service providers who OUTFIT and FURNISH hotels and restaurants. Combines web scraping, AI-powered data enrichment, and validation to build a comprehensive directory of hospitality B2B suppliers.

### Target Companies
- Hotel interior design firms
- Restaurant outfitting specialists  
- Hospitality lighting designers
- Commercial furniture suppliers for hotels/restaurants
- Kitchen equipment suppliers for hotels
- Hospitality textile and flooring specialists
- Audio/visual technology providers
- Wellness & spa equipment suppliers

### Key Features
- Automated web scraping with German search terms ('hoteleinrichtung', 'hotelausstatter', 'gastronomieeinrichtung')
- Multi-AI company research (Claude, Perplexity, ChatGPT)
- Austrian business registry (UID) extraction from Impressum pages
- GDPR-compliant data handling
- B2B service provider scoring & qualification
- Company portfolio and specialization analysis
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

### Company Model
```typescript
interface Company {
  id: string;
  companyName: string;
  type: 'INTERIOR_DESIGN' | 'HOTEL_OUTFITTER' | 'RESTAURANT_OUTFITTER' | 'LIGHTING_SPECIALIST' | 'FURNITURE_SUPPLIER' | 'KITCHEN_EQUIPMENT';
  category: string; // e.g., 'luxury specialist', 'commercial supplier'
  
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
  employeeCount: number; // company size
  yearEstablished: number;
  serviceRadius: number; // service area in km
  uid: string; // Austrian business ID
  
  // Service Details
  specializations: string[]; // hospitality sectors served
  certifications: string[]; // relevant certifications
  portfolioUrl: string; // portfolio website
  minimumProject: number; // minimum project size EUR
  
  // Business Intelligence
  score: number; // 0-100
  qualificationStatus: 'NEW' | 'QUALIFIED' | 'CONTACTED' | 'OPPORTUNITY';
  currentProjects: number; // active project count
  avgProjectValue: number; // average project value
  hospitalityFocus: string[]; // target segments
  
  // Enrichment
  decisionMakers: Contact[];
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
- Company identification: 200+ companies/month
- Data accuracy: >95%
- Processing time: <45s per company
- Manual review: <3 min per company  
- Cost per company: <€0.75

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

Built with focus on Austrian hospitality B2B service providers by [Your Company]

**Market Focus**: Austrian companies that provide services TO the hospitality industry - interior designers, outfitters, suppliers, and specialists serving hotels and restaurants.

---

**Version**: 1.0.0  
**Last Updated**: November 2024