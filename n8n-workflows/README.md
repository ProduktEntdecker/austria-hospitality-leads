# N8N Workflows for Austria Hospitality Leads

This directory contains all N8N workflow templates for automated lead generation, enrichment, and validation.

## Workflow Categories

### 1. Scraping Workflows (`/scraping`)
- **hotel-directories.json** - Scrapes Austrian hotel directories
- **restaurant-guides.json** - Scrapes restaurant listing sites
- **google-maps.json** - Extracts business data from Google Maps
- **tripadvisor.json** - Scrapes TripAdvisor listings
- **booking-com.json** - Extracts hotel data from Booking.com

### 2. Enrichment Workflows (`/enrichment`)
- **ai-enrichment.json** - Multi-AI enrichment pipeline
- **contact-finder.json** - Finds decision maker contacts
- **social-media.json** - Gathers social media profiles
- **business-verification.json** - Verifies business status
- **competitor-analysis.json** - Analyzes local competitors

### 3. Validation Workflows (`/validation`)
- **lead-scoring.json** - Automated lead scoring
- **duplicate-detection.json** - Finds and merges duplicates
- **data-quality.json** - Validates data completeness
- **gdpr-compliance.json** - Ensures GDPR compliance
- **manual-review-queue.json** - Routes leads for manual review

## Setup Instructions

### 1. Import Workflows

```bash
# Import all workflows at once
npm run n8n:import

# Or import individually in N8N UI
# Settings > Workflows > Import from File
```

### 2. Configure Credentials

Required credentials in N8N:
- **API Keys**: Claude, OpenAI, Perplexity
- **Database**: PostgreSQL connection
- **Webhook**: Backend API webhook URL
- **HTTP Auth**: For protected endpoints

### 3. Set Environment Variables

In N8N settings, add these environment variables:
```
BACKEND_API_URL=http://localhost:3001
WEBHOOK_SECRET=your-webhook-secret
RATE_LIMIT_DELAY=1000
MAX_CONCURRENT_REQUESTS=3
```

### 4. Configure Webhooks

Each workflow uses webhooks to communicate with the backend:
- Scraping results: `POST /api/webhooks/n8n/scraping`
- Enrichment complete: `POST /api/webhooks/n8n/enrichment`
- Validation results: `POST /api/webhooks/n8n/validation`

## Workflow Triggers

### Scheduled Triggers
- **Daily**: Hotel directory scraping (6 AM CET)
- **Weekly**: Full database enrichment (Sunday 2 AM CET)
- **Hourly**: New lead validation

### Manual Triggers
- API endpoint: `POST /api/n8n/trigger/{workflow-id}`
- N8N UI: Manual execution button
- CLI: `n8n execute --id {workflow-id}`

### Event Triggers
- New lead created → Enrichment workflow
- Lead updated → Validation workflow
- Bulk import → Duplicate detection

## Best Practices

### Rate Limiting
- Implement delays between requests
- Use exponential backoff for retries
- Respect robots.txt and terms of service

### Error Handling
- Set up error workflows for failed executions
- Log all errors to monitoring system
- Implement retry logic with limits

### Data Privacy
- Never store sensitive data in workflows
- Use encryption for API keys
- Implement GDPR data retention policies

### Performance
- Use pagination for large datasets
- Implement caching where appropriate
- Monitor execution times and optimize

## Monitoring

### Metrics to Track
- Execution success rate
- Average execution time
- API call costs
- Lead quality scores
- Data completeness

### Alerting
Set up alerts for:
- Failed workflow executions
- API rate limit warnings
- Low lead quality trends
- High error rates

## Troubleshooting

### Common Issues

1. **Rate Limiting**
   - Solution: Increase delays between requests
   - Check API rate limits in documentation

2. **Authentication Failures**
   - Solution: Verify API keys are correct
   - Check credential expiration

3. **Data Quality Issues**
   - Solution: Add validation nodes
   - Implement data cleaning steps

4. **Performance Problems**
   - Solution: Optimize database queries
   - Use batch processing

## Workflow Documentation

Detailed documentation for each workflow is available in:
- `/docs/technical/n8n-workflows.md`
- Individual workflow files contain inline documentation
- N8N UI shows node-level descriptions

## Support

For workflow issues:
1. Check N8N execution logs
2. Review error details in monitoring
3. Contact technical team

## Version History

- v1.0.0 - Initial workflow set
- v1.1.0 - Added Booking.com scraper
- v1.2.0 - Improved AI enrichment
- v1.3.0 - GDPR compliance updates