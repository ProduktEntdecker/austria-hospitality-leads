import { z } from 'zod';

// Base validation schemas
export const EmailSchema = z.string().email('Invalid email format');
export const PhoneSchema = z.string().regex(/^(\+43|0043|0)[1-9]\d{1,14}$/, 'Invalid Austrian phone number');
export const MobilePhoneSchema = z.string().regex(/^(\+43|0043|0)6[0-9]{8,9}$/, 'Invalid Austrian mobile number');
export const WebsiteSchema = z.string().url('Invalid website URL').optional();
export const PostalCodeSchema = z.string().regex(/^\d{4}$/, 'Invalid Austrian postal code');

// Business Type Schema
export const BusinessTypeSchema = z.enum([
  'INTERIOR_DESIGN',      // Innenarchitektur für Hotels/Restaurants
  'HOTEL_OUTFITTER',      // Hotelausstatter
  'RESTAURANT_OUTFITTER', // Gastronomieeinrichtung
  'LIGHTING_SPECIALIST',  // Lichtplanung
  'FURNITURE_SUPPLIER',   // Möbellieferant
  'KITCHEN_EQUIPMENT',    // Küchenausstattung
  'TEXTILE_SUPPLIER',     // Textilien/Bettwäsche
  'FLOORING_SPECIALIST',  // Bodenbeläge
  'BATHROOM_OUTFITTER',   // Badeinrichtung
  'AV_TECHNOLOGY',        // Audio/Video Technik
  'SIGNAGE_DESIGN',       // Beschilderung/Corporate Design
  'WELLNESS_EQUIPMENT',   // Wellness/Spa Ausstattung
  'OTHER'
]);

// Hospitality Focus Schema
export const HospitalityFocusSchema = z.enum([
  'LUXURY_HOTELS',      // 5-Stern Hotels
  'BUSINESS_HOTELS',    // Business Hotels
  'BOUTIQUE_HOTELS',    // Boutique Hotels
  'CHAIN_HOTELS',       // Hotelketten
  'INDEPENDENT_HOTELS', // Unabhängige Hotels
  'FINE_DINING',        // Gehobene Gastronomie
  'CASUAL_DINING',      // Casual Restaurants
  'FAST_FOOD',          // Schnellrestaurants
  'BARS_LOUNGES',       // Bars & Lounges
  'CAFES',              // Cafés
  'WELLNESS_SPAS',      // Wellness & Spa
  'CONFERENCE_VENUES',  // Tagungshotels
  'MOUNTAIN_LODGES',    // Berghütten
  'URBAN_VENUES',       // Stadthotels
  'RESORT_HOTELS'       // Resort Hotels
]);

// Austrian Regions Schema
export const AustrianRegionSchema = z.enum([
  'Wien',
  'Niederösterreich',
  'Oberösterreich',
  'Steiermark',
  'Kärnten',
  'Salzburg',
  'Tirol',
  'Vorarlberg',
  'Burgenland'
]);

// Lead Status Schema
export const LeadStatusSchema = z.enum([
  'NEW',
  'QUALIFIED',
  'CONTACTED',
  'OPPORTUNITY', 
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
  'DISQUALIFIED',
  'ON_HOLD'
]);

// Budget Range Schema
export const BudgetRangeSchema = z.enum([
  'UNDER_10K',
  'BETWEEN_10K_50K',
  'BETWEEN_50K_100K', 
  'BETWEEN_100K_500K',
  'OVER_500K'
]);

// Core Lead Schema
export const LeadSchema = z.object({
  id: z.string().cuid().optional(),
  
  // Required fields
  companyName: z.string().min(1, 'Company name is required').max(255),
  type: BusinessTypeSchema,
  city: z.string().min(1, 'City is required').max(100),
  region: AustrianRegionSchema,
  
  // Optional basic info
  category: z.string().max(100).optional(),
  website: WebsiteSchema,
  email: EmailSchema.optional(),
  phone: PhoneSchema.optional(),
  mobile: MobilePhoneSchema.optional(), // Added per Andy's feedback - crucial for Austrian businesses
  
  // Location details
  address: z.string().max(500).optional(),
  postalCode: PostalCodeSchema.optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  
  // Business details
  employeeCount: z.number().int().min(1).max(10000).optional(),
  yearEstablished: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  serviceRadius: z.number().int().min(1).max(1000).optional(), // service radius in km
  
  // B2B Service Details
  specializations: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  portfolioUrl: z.string().url().optional(),
  minimumProject: z.number().int().min(1000).optional(), // minimum project size in EUR
  
  // Lead management
  status: LeadStatusSchema.default('NEW'),
  score: z.number().int().min(0).max(100).default(0),
  qualificationNotes: z.string().max(2000).optional(),
  assignedTo: z.string().optional(),
  
  // Business intelligence
  currentProjects: z.number().int().min(0).default(0),
  avgProjectValue: z.number().int().min(1000).optional(),
  hospitalityFocus: z.array(HospitalityFocusSchema).default([]),
  decisionMakerRole: z.string().max(100).optional(),
  
  // AI Verification (per Andy's requirements)
  hospitalityVerified: z.boolean().default(false), // GPT-4 Vision verification of hospitality projects
  imageAnalysisConfidence: z.number().int().min(0).max(100).optional(),
  genuineSupplierScore: z.number().int().min(0).max(100).optional(), // Anti-SEO filtering score
  
  // German SEO Optimization (98% Austrian search language match)
  germanSearchTerms: z.array(z.string()).default([]), // German keywords that found this lead
  austrianRegion: z.enum(['wien', 'salzburg', 'innsbruck', 'graz', 'linz', 'other']).optional(), // Regional targeting
  searchLanguage: z.enum(['german', 'english', 'mixed']).default('german'), // Language detection
  seoQualityScore: z.number().int().min(0).max(100).default(0), // German SEO factors
  regionalFocus: z.array(z.string()).default([]), // Wien, Salzburg, Tirol targeting
  seasonalRelevance: z.enum(['april_renovation', 'new_opening', 'tourism_prep', 'general']).default('general'),
  
  // Metadata
  source: z.string().max(255),
  sourceUrl: z.string().url().optional(),
  
  // GDPR
  gdprConsent: z.boolean().default(false),
  gdprConsentDate: z.date().optional(),
});

// Create Lead Schema (for API endpoints)
export const CreateLeadSchema = LeadSchema.omit({ 
  id: true, 
  score: true,
  status: true 
});

// Update Lead Schema
export const UpdateLeadSchema = LeadSchema.partial().omit({ id: true });

// Contact Schema
export const ContactSchema = z.object({
  id: z.string().cuid().optional(),
  leadId: z.string().cuid(),
  
  // Personal info
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(), 
  fullName: z.string().min(1).max(200),
  title: z.string().max(100).optional(),
  role: z.string().min(1).max(150),
  
  // Contact details
  email: EmailSchema.optional(),
  phone: PhoneSchema.optional(),
  mobile: MobilePhoneSchema.optional(), // Added per Andy's feedback - crucial for Austrian businesses
  linkedIn: z.string().url().optional(),
  
  // Metadata
  isPrimary: z.boolean().default(false),
  source: z.string().max(255).optional(),
  confidence: z.number().int().min(0).max(100).default(0),
});

export const CreateContactSchema = ContactSchema.omit({ id: true });

// AI Enrichment Schema
export const EnrichmentDataSchema = z.object({
  id: z.string().cuid().optional(),
  leadId: z.string().cuid(),
  
  aiService: z.enum(['CLAUDE', 'OPENAI', 'PERPLEXITY', 'DEEPSEEK']),
  model: z.string().optional(),
  
  data: z.record(z.any()), // JSON data
  confidence: z.number().int().min(0).max(100),
  cost: z.number().min(0).optional(),
  
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']).default('PENDING'),
  error: z.string().optional(),
});

// Activity Schema
export const ActivitySchema = z.object({
  id: z.string().cuid().optional(),
  leadId: z.string().cuid(),
  
  type: z.enum([
    'LEAD_CREATED',
    'LEAD_UPDATED', 
    'ENRICHMENT_COMPLETED',
    'VALIDATION_COMPLETED',
    'CONTACT_ATTEMPTED',
    'EMAIL_SENT',
    'MEETING_SCHEDULED',
    'NOTE_ADDED',
    'STATUS_CHANGED',
    'TAG_ADDED'
  ]),
  description: z.string().min(1).max(1000),
  userId: z.string().optional(),
  
  metadata: z.record(z.any()).optional(),
});

export const CreateActivitySchema = ActivitySchema.omit({ id: true });

// Validation Schema  
export const ValidationSchema = z.object({
  id: z.string().cuid().optional(),
  leadId: z.string().cuid(),
  
  validatedBy: z.string().min(1),
  result: z.enum(['VALID', 'INVALID', 'REQUIRES_REVIEW', 'INCOMPLETE_DATA']),
  notes: z.string().max(2000).optional(),
  
  // Validation criteria
  businessActive: z.boolean().optional(),
  contactInfoValid: z.boolean().optional(),
  renovationPotential: z.boolean().optional(),
  gdprCompliant: z.boolean().optional(),
});

export const CreateValidationSchema = ValidationSchema.omit({ id: true });

// Search and Filter Schemas
export const LeadSearchSchema = z.object({
  query: z.string().optional(),
  type: BusinessTypeSchema.optional(),
  region: AustrianRegionSchema.optional(),
  city: z.string().optional(),
  status: LeadStatusSchema.optional(),
  minScore: z.number().int().min(0).max(100).optional(),
  maxScore: z.number().int().min(0).max(100).optional(),
  budgetRange: BudgetRangeSchema.optional(),
  renovationPlanned: z.boolean().optional(),
  gdprConsent: z.boolean().optional(),
  source: z.string().optional(),
  
  // Pagination
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  
  // Sorting
  sortBy: z.enum(['createdAt', 'updatedAt', 'score', 'companyName', 'city']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Export Schemas
export const ExportSchema = z.object({
  format: z.enum(['csv', 'json', 'xlsx']),
  fields: z.array(z.string()).optional(),
  filters: LeadSearchSchema.omit({ page: true, limit: true }).optional(),
});

// Bulk Operations
export const BulkUpdateLeadSchema = z.object({
  leadIds: z.array(z.string().cuid()).min(1).max(100),
  updates: UpdateLeadSchema,
});

export const BulkDeleteLeadSchema = z.object({
  leadIds: z.array(z.string().cuid()).min(1).max(100),
});

// N8N Webhook Schemas
export const N8NWebhookSchema = z.object({
  workflow: z.string(),
  timestamp: z.number(),
  data: z.record(z.any()),
});

export const ScrapingWebhookSchema = N8NWebhookSchema.extend({
  leads: z.array(CreateLeadSchema),
});

export const EnrichmentWebhookSchema = N8NWebhookSchema.extend({
  leadId: z.string().cuid(),
  enrichmentData: EnrichmentDataSchema.omit({ id: true, leadId: true }),
});

// Type exports for use in TypeScript
export type Lead = z.infer<typeof LeadSchema>;
export type CreateLead = z.infer<typeof CreateLeadSchema>;
export type UpdateLead = z.infer<typeof UpdateLeadSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type CreateContact = z.infer<typeof CreateContactSchema>;
export type EnrichmentData = z.infer<typeof EnrichmentDataSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type CreateActivity = z.infer<typeof CreateActivitySchema>;
export type Validation = z.infer<typeof ValidationSchema>;
export type CreateValidation = z.infer<typeof CreateValidationSchema>;
export type LeadSearch = z.infer<typeof LeadSearchSchema>;
export type ExportRequest = z.infer<typeof ExportSchema>;
export type BulkUpdateLead = z.infer<typeof BulkUpdateLeadSchema>;
export type ScrapingWebhook = z.infer<typeof ScrapingWebhookSchema>;
export type EnrichmentWebhook = z.infer<typeof EnrichmentWebhookSchema>;