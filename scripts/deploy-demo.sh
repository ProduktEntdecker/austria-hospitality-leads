#!/bin/bash

# 🚀 Andy Demo Deployment Script
# Deploys the Austrian Hospitality Leads system for demo purposes

echo "🎯 Starting Andy's Demo Deployment..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_dependencies() {
    echo -e "${BLUE}📋 Checking dependencies...${NC}"
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git is not installed${NC}"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All dependencies check passed${NC}"
}

# Create demo branch
create_demo_branch() {
    echo -e "${BLUE}🌳 Creating demo branch...${NC}"
    
    git checkout -b demo/andy-presentation 2>/dev/null || git checkout demo/andy-presentation
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Demo branch ready${NC}"
    else
        echo -e "${RED}❌ Failed to create demo branch${NC}"
        exit 1
    fi
}

# Add demo-specific configurations
setup_demo_config() {
    echo -e "${BLUE}⚙️ Setting up demo configuration...${NC}"
    
    # Create demo environment file
    cat > .env.demo << EOF
# Demo Environment Configuration
NODE_ENV=production
DEMO_MODE=true
DEMO_PASSWORD=AndyDemo2025!

# Database (Railway will provide)
DATABASE_URL=\${DATABASE_URL}
REDIS_URL=\${REDIS_URL}

# Application Settings
APP_NAME="Austrian Hospitality Leads - Andy's Demo"
APP_URL=https://andy-demo.austrialeads.com
API_URL=https://andy-demo.austrialeads.com/api

# Session Configuration
SESSION_SECRET=demo-session-secret-change-in-production
SESSION_DURATION=86400000

# Demo Features
ENABLE_DEMO_DATA=true
DEMO_RATE_LIMIT=100
DEMO_SESSION_DURATION=24

# Add your API keys here (will be set via hosting platform)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
PERPLEXITY_API_KEY=
DEEPSEEK_API_KEY=
EOF
    
    echo -e "${GREEN}✅ Demo configuration created${NC}"
}

# Update package.json for demo
update_package_json() {
    echo -e "${BLUE}📦 Updating package.json for demo...${NC}"
    
    # Add demo-specific scripts if they don't exist
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    pkg.scripts = pkg.scripts || {};
    pkg.scripts['demo:build'] = 'npm run build';
    pkg.scripts['demo:start'] = 'NODE_ENV=production DEMO_MODE=true npm start';
    pkg.scripts['demo:dev'] = 'NODE_ENV=development DEMO_MODE=true npm run dev';
    
    // Add demo-specific dependencies if needed
    pkg.dependencies = pkg.dependencies || {};
    
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    console.log('✅ Package.json updated for demo');
    "
}

# Create Railway configuration
create_railway_config() {
    echo -e "${BLUE}🚄 Creating Railway configuration...${NC}"
    
    # Create railway.json if it doesn't exist
    cat > railway.json << EOF
{
  "\$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run demo:build"
  },
  "deploy": {
    "startCommand": "npm run demo:start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  },
  "environments": {
    "production": {
      "variables": {
        "NODE_ENV": "production",
        "DEMO_MODE": "true",
        "DEMO_PASSWORD": "AndyDemo2025!"
      }
    }
  }
}
EOF
    
    echo -e "${GREEN}✅ Railway configuration created${NC}"
}

# Create Docker configuration for alternative hosting
create_docker_config() {
    echo -e "${BLUE}🐳 Creating Docker configuration...${NC}"
    
    cat > Dockerfile.demo << EOF
# Demo Dockerfile for Andy's presentation
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Set demo environment
ENV NODE_ENV=production
ENV DEMO_MODE=true
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "run", "demo:start"]
EOF
    
    # Create docker-compose for local demo testing
    cat > docker-compose.demo.yml << EOF
version: '3.8'

services:
  demo-app:
    build:
      context: .
      dockerfile: Dockerfile.demo
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DEMO_MODE=true
      - DEMO_PASSWORD=AndyDemo2025!
      - DATABASE_URL=postgresql://demo:demo@demo-db:5432/demo
      - REDIS_URL=redis://demo-redis:6379
    depends_on:
      - demo-db
      - demo-redis
    restart: unless-stopped

  demo-db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=demo
      - POSTGRES_USER=demo
      - POSTGRES_PASSWORD=demo
    ports:
      - "5432:5432"
    volumes:
      - demo_db_data:/var/lib/postgresql/data
    restart: unless-stopped

  demo-redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - demo_redis_data:/data
    restart: unless-stopped

volumes:
  demo_db_data:
  demo_redis_data:
EOF
    
    echo -e "${GREEN}✅ Docker configuration created${NC}"
}

# Commit demo changes
commit_demo_changes() {
    echo -e "${BLUE}💾 Committing demo changes...${NC}"
    
    git add .
    git commit -m "feat: Add demo deployment configuration for Andy

## Demo Features
- Password-protected demo environment
- Pre-loaded Austrian hospitality companies
- German SEO demonstration ready
- Secure API key management showcase

## Deployment Ready
- Railway configuration included
- Docker setup for alternative hosting
- Demo-specific environment variables
- Authentication and session management

🎯 Ready for Andy's demo presentation"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Demo changes committed${NC}"
    else
        echo -e "${RED}❌ Failed to commit changes${NC}"
        exit 1
    fi
}

# Push to GitHub
push_demo_branch() {
    echo -e "${BLUE}🚀 Pushing demo branch to GitHub...${NC}"
    
    git push origin demo/andy-presentation
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Demo branch pushed to GitHub${NC}"
    else
        echo -e "${RED}❌ Failed to push demo branch${NC}"
        exit 1
    fi
}

# Display deployment instructions
show_deployment_instructions() {
    echo ""
    echo -e "${GREEN}🎉 Demo Deployment Setup Complete!${NC}"
    echo "=================================="
    echo ""
    echo -e "${YELLOW}📋 Next Steps for Andy's Demo:${NC}"
    echo ""
    echo "1. 🚄 Deploy on Railway (Recommended):"
    echo "   • Go to https://railway.app"
    echo "   • Connect your GitHub account"
    echo "   • Select the 'demo/andy-presentation' branch"
    echo "   • Add your API keys in Railway environment variables"
    echo ""
    echo "2. 🔐 Demo Access Information:"
    echo "   • URL: https://your-app.up.railway.app"
    echo "   • Password: AndyDemo2025!"
    echo "   • Session: 24 hours"
    echo ""
    echo "3. 🔑 Required Environment Variables:"
    echo "   • ANTHROPIC_API_KEY=your-claude-key"
    echo "   • OPENAI_API_KEY=your-openai-key"
    echo "   • PERPLEXITY_API_KEY=your-perplexity-key (optional)"
    echo ""
    echo "4. 🎯 Demo Features Ready:"
    echo "   • German SEO optimization showcase"
    echo "   • Austrian company discovery"
    echo "   • Mobile number extraction demo"
    echo "   • API key management system"
    echo ""
    echo -e "${BLUE}💡 Alternative Deployment Options:${NC}"
    echo "   • Local testing: docker-compose -f docker-compose.demo.yml up"
    echo "   • Vercel: Deploy frontend, use serverless functions"
    echo "   • DigitalOcean: Use provided Dockerfile.demo"
    echo ""
    echo -e "${GREEN}✅ Ready to impress Andy with your Austrian hospitality lead discovery system!${NC}"
    echo ""
}

# Main execution
main() {
    echo -e "${BLUE}🎯 Austrian Hospitality Leads - Andy Demo Setup${NC}"
    echo ""
    
    check_dependencies
    create_demo_branch
    setup_demo_config
    update_package_json
    create_railway_config
    create_docker_config
    commit_demo_changes
    push_demo_branch
    show_deployment_instructions
    
    echo ""
    echo -e "${GREEN}🚀 Demo deployment setup completed successfully!${NC}"
}

# Run the script
main "$@"