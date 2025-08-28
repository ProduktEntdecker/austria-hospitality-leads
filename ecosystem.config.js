// PM2 ecosystem file for production deployment
module.exports = {
  apps: [
    {
      name: 'austria-leads-backend',
      script: './backend/dist/index.js',
      cwd: '/opt/austria-hospitality-leads',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      // Memory and CPU limits
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      
      // Restart strategy
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Health monitoring
      health_check_url: 'http://localhost:3001/health',
      health_check_grace_period: 30000
    },
    {
      name: 'austria-leads-frontend', 
      script: './frontend/server.js',
      cwd: '/opt/austria-hospitality-leads',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://your-domain.com'
      },
      
      // Memory limits
      max_memory_restart: '512M',
      
      // Restart strategy  
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Logging
      log_file: './logs/frontend-combined.log',
      out_file: './logs/frontend-out.log', 
      error_file: './logs/frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'https://github.com/ProduktEntdecker/austria-hospitality-leads.git',
      path: '/opt/austria-hospitality-leads',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 startOrReload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};