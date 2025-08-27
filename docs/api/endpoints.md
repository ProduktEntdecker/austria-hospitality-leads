# API Documentation - Austria Hospitality Leads

## Base URL
- Development: `http://localhost:3001/api`
- Production: `https://api.austrialeads.at/api`

## Authentication
Most endpoints require authentication via Bearer token:
```
Authorization: Bearer <jwt_token>
```

## Content Types
- Request: `application/json`
- Response: `application/json`

## Error Responses
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Rate Limiting
- 100 requests per minute per API key
- 1000 requests per hour per API key

---

## Leads API

### Get All Leads
```http
GET /api/leads
```

#### Query Parameters
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `query` (string): Search query
- `type` (string): Business type filter
- `region` (string): Austrian region filter
- `city` (string): City filter
- `status` (string): Lead status filter
- `minScore` (number): Minimum lead score
- `maxScore` (number): Maximum lead score
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): Sort order (asc/desc, default: desc)

#### Response
```json
{
  "leads": [
    {
      "id": "cuid123",
      "companyName": "Hotel Alpenhof",
      "type": "HOTEL",
      "category": "4-star",
      "city": "Innsbruck",
      "region": "Tirol",
      "website": "https://hotel-alpenhof.at",
      "email": "info@hotel-alpenhof.at",
      "phone": "+43512123456",
      "address": "Olympiastraße 10, 6020 Innsbruck",
      "postalCode": "6020",
      "capacity": 120,
      "starRating": 4,
      "status": "NEW",
      "score": 85,
      "renovationPlanned": true,
      "budgetRange": "BETWEEN_100K_500K",
      "source": "booking.com",
      "createdAt": "2024-11-20T10:00:00Z",
      "updatedAt": "2024-11-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Get Single Lead
```http
GET /api/leads/{id}
```

#### Response
```json
{
  "id": "cuid123",
  "companyName": "Hotel Alpenhof",
  // ... full lead object with relations
  "contacts": [
    {
      "id": "contact123",
      "fullName": "Johann Mueller",
      "role": "General Manager",
      "email": "j.mueller@hotel-alpenhof.at",
      "phone": "+43512123456",
      "isPrimary": true
    }
  ],
  "activities": [
    {
      "id": "activity123",
      "type": "LEAD_CREATED",
      "description": "Lead created from booking.com scraper",
      "createdAt": "2024-11-20T10:00:00Z"
    }
  ],
  "enrichmentData": [],
  "validations": []
}
```

### Create Lead
```http
POST /api/leads
```

#### Request Body
```json
{
  "companyName": "Restaurant Steirereck",
  "type": "RESTAURANT",
  "city": "Wien",
  "region": "Wien",
  "category": "fine dining",
  "website": "https://steirereck.at",
  "email": "info@steirereck.at",
  "phone": "+431713315168",
  "address": "Am Heumarkt 2a, 1030 Wien",
  "postalCode": "1030",
  "capacity": 80,
  "source": "manual_entry"
}
```

### Update Lead
```http
PUT /api/leads/{id}
```

#### Request Body
```json
{
  "status": "QUALIFIED",
  "score": 90,
  "qualificationNotes": "High potential client, recently renovated lobby",
  "budgetRange": "BETWEEN_100K_500K"
}
```

### Delete Lead
```http
DELETE /api/leads/{id}
```

---

## Contacts API

### Get Lead Contacts
```http
GET /api/leads/{leadId}/contacts
```

### Add Contact
```http
POST /api/leads/{leadId}/contacts
```

#### Request Body
```json
{
  "fullName": "Maria Huber",
  "role": "Facility Manager",
  "email": "m.huber@hotel-example.at",
  "phone": "+43512987654",
  "isPrimary": false,
  "source": "linkedin"
}
```

### Update Contact
```http
PUT /api/contacts/{id}
```

### Delete Contact
```http
DELETE /api/contacts/{id}
```

---

## AI Enrichment API

### Trigger Enrichment
```http
POST /api/leads/{id}/enrich
```

#### Request Body
```json
{
  "services": ["claude", "perplexity", "openai"],
  "priority": "high"
}
```

#### Response
```json
{
  "jobId": "job123",
  "status": "PENDING",
  "estimatedDuration": 30,
  "services": ["claude", "perplexity", "openai"]
}
```

### Get Enrichment Status
```http
GET /api/enrichment/{jobId}
```

### Get Enrichment Results
```http
GET /api/leads/{id}/enrichment
```

---

## Validation API

### Validate Lead
```http
POST /api/leads/{id}/validate
```

#### Request Body
```json
{
  "validatedBy": "user123",
  "result": "VALID",
  "notes": "Business confirmed active, good renovation potential",
  "businessActive": true,
  "contactInfoValid": true,
  "renovationPotential": true,
  "gdprCompliant": true
}
```

### Get Validation Queue
```http
GET /api/validation/queue
```

#### Query Parameters
- `priority` (string): Filter by priority level
- `assignedTo` (string): Filter by assigned user

---

## Export API

### Export Leads
```http
POST /api/export
```

#### Request Body
```json
{
  "format": "csv",
  "filters": {
    "type": "HOTEL",
    "region": "Tirol",
    "minScore": 70
  },
  "fields": [
    "companyName",
    "city",
    "email",
    "phone",
    "score",
    "status"
  ]
}
```

#### Response
```json
{
  "downloadUrl": "/api/exports/export-123.csv",
  "filename": "austria-hotel-leads-2024-11-20.csv",
  "recordCount": 85,
  "expiresAt": "2024-11-21T10:00:00Z"
}
```

---

## Bulk Operations API

### Bulk Update
```http
PUT /api/leads/bulk
```

#### Request Body
```json
{
  "leadIds": ["lead1", "lead2", "lead3"],
  "updates": {
    "assignedTo": "user123",
    "status": "CONTACTED"
  }
}
```

### Bulk Delete
```http
DELETE /api/leads/bulk
```

#### Request Body
```json
{
  "leadIds": ["lead1", "lead2", "lead3"]
}
```

---

## Statistics API

### Get Dashboard Stats
```http
GET /api/stats/dashboard
```

#### Response
```json
{
  "totalLeads": 1250,
  "newLeads": 45,
  "qualifiedLeads": 320,
  "avgScore": 72,
  "conversionRate": 0.24,
  "topRegions": [
    { "region": "Wien", "count": 340 },
    { "region": "Tirol", "count": 285 }
  ],
  "businessTypes": [
    { "type": "HOTEL", "count": 650 },
    { "type": "RESTAURANT", "count": 480 }
  ],
  "recentActivity": [
    {
      "type": "LEAD_CREATED",
      "count": 12,
      "timestamp": "2024-11-20T09:00:00Z"
    }
  ]
}
```

### Get Lead Quality Trends
```http
GET /api/stats/quality-trends
```

#### Query Parameters
- `period` (string): Time period (7d, 30d, 90d)
- `groupBy` (string): Group by field (day, week, month)

---

## Webhooks API

### N8N Scraping Webhook
```http
POST /api/webhooks/n8n/scraping
```

#### Request Body
```json
{
  "workflow": "hotel-directory-scraper",
  "timestamp": 1637404800000,
  "leads": [
    {
      "companyName": "Hotel Example",
      "type": "HOTEL",
      "city": "Salzburg",
      "region": "Salzburg",
      "source": "austriatourism.at"
    }
  ]
}
```

### N8N Enrichment Webhook
```http
POST /api/webhooks/n8n/enrichment
```

#### Request Body
```json
{
  "workflow": "ai-enrichment",
  "timestamp": 1637404800000,
  "leadId": "lead123",
  "enrichmentData": {
    "aiService": "CLAUDE",
    "confidence": 85,
    "data": {
      "lastRenovation": "2019",
      "decisionMakers": [
        {
          "name": "Hans Müller",
          "role": "General Manager"
        }
      ]
    }
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `NOT_FOUND` | Resource not found |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `RATE_LIMITED` | Too many requests |
| `AI_SERVICE_ERROR` | AI service unavailable |
| `DATABASE_ERROR` | Database operation failed |
| `EXTERNAL_API_ERROR` | External service error |