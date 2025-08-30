// Company and Lead Types
export interface Lead {
  id: string;
  name: string;
  companyName: string;
  description?: string;
  website?: string;
  type?: string;
  city?: string;
  region?: string;
  country?: string;
  address?: string;
  postalCode?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  contactPerson?: string;
  employeeCount?: number;
  yearEstablished?: number;
  uid?: string; // Austrian business registry ID
  hospitalityFocus?: string[];
  location?: {
    city?: string;
    region?: string;
    country?: string;
    address?: string;
  };
  contact?: {
    phone?: string;
    mobile?: string;
    email?: string;
    contactPerson?: string;
  };
  scoring?: {
    overall: number;
    genuineSupplier: number;
    hospitalityFocus: number;
    businessCredibility: number;
    contactTransparency: number;
  };
  specializations?: string[];
  projects?: string[];
  searchTermsFound?: string[];
  discovered?: string;
  confidence?: number;
  hospitalityVerified?: boolean;
  imageAnalysisConfidence?: number;
  genuineSupplierScore?: number;
  germanSearchTerms?: string[];
  austrianRegion?: string;
  searchLanguage?: 'de' | 'en' | 'mixed';
  seoQualityScore?: number;
  regionalFocus?: string;
  seasonalRelevance?: string;
}

export interface Contact {
  id: string;
  leadId: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  linkedin?: string;
}

export interface Company extends Lead {
  employees?: number;
  founded?: number;
  revenue?: string;
  uid?: string; // Austrian business registry ID
  vatNumber?: string;
  businessType?: string;
  certifications?: string[];
}

export interface CompanyResearch {
  companyName: string;
  type: string;
  city: string;
  region: string;
  [key: string]: any; // For additional research data
}

// AI Service Types
export interface AIAnalysisResult {
  success: boolean;
  data?: any;
  error?: string;
  confidence?: number;
  provider: 'anthropic' | 'openai' | 'perplexity' | 'deepseek';
}

export interface ImageAnalysisResult {
  hospitalityVerified: boolean;
  confidence: number;
  projectTypes: string[];
  explanation: string;
  genuineSupplierScore: number;
}

export interface MobileExtractionResult {
  mobileNumbers: string[];
  confidence: number;
}

// German SEO Types
export interface GermanSEOAnalysis {
  seoQualityScore: number;
  germanSearchTerms: string[];
  austrianRegion: string;
  searchLanguage: 'de' | 'en' | 'mixed';
  regionalFocus: string;
  seasonalRelevance: string;
  recommendations: string[];
  marketOpportunity: {
    score: number;
    description: string;
    potential: string;
  };
}

// Filtering Types  
export interface FilteringResult {
  genuineSupplierScore: number;
  qualityFactors: {
    contentAuthenticity: number;
    businessCredibility: number;
    hospitalitySpecialization: number;
    contactTransparency: number;
    projectPortfolio: number;
  };
  redFlags: string[];
  recommendations: string[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Environment Types
export interface AppConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
  PERPLEXITY_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  DEMO_MODE?: boolean;
  DEMO_PASSWORD?: string;
}