import OpenAI from 'openai';
import { logger } from '@utils/logger';
import { Lead } from '@/types';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  async enrichLeadData(lead: Partial<Lead>): Promise<{
    enrichedData: Record<string, any>;
    confidence: number;
    dataSources: string[];
  }> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert in Austrian hospitality outfitting industry analysis. 
            Enrich B2B lead data for companies that provide services TO hotels and restaurants.`
          },
          {
            role: 'user',
            content: `Analyze and enrich this Austrian hospitality outfitting company lead:
              ${JSON.stringify(lead, null, 2)}
              
              This is a B2B service provider (interior designer, furniture supplier, equipment provider, etc.).
              
              Provide additional insights on:
              1. Service category specialization and market positioning
              2. Typical project sizes and budget ranges they handle
              3. Business seasonality and project cycles
              4. Key decision-making factors for their services
              5. Partnership and collaboration opportunities
              6. Regional market presence and competition
              7. Growth potential and expansion possibilities
              
              Return JSON with enriched data, confidence score (0-100), and data sources used.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0].message.content;
      return content ? JSON.parse(content) : {
        enrichedData: {},
        confidence: 0,
        dataSources: []
      };
    } catch (error) {
      logger.error('OpenAI enrichment error', { error, lead });
      throw error;
    }
  }

  async scoreLeadQuality(lead: Lead): Promise<{
    score: number;
    factors: {
      businessSize: number;
      serviceCapability: number;
      marketPresence: number;
      accessibility: number;
      partnershipPotential: number;
    };
    explanation: string;
  }> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in B2B lead scoring for Austrian hospitality outfitting market. Score companies that provide services TO hotels and restaurants.'
          },
          {
            role: 'user',
            content: `Score this Austrian hospitality outfitting company as a business partner/client:
              ${JSON.stringify(lead, null, 2)}
              
              This is a B2B service provider evaluation. Scoring criteria (0-20 each):
              1. Business Size (employee count, project capacity, market reach)
              2. Service Capability (specializations, portfolio strength, expertise)
              3. Market Presence (reputation, client base, geographic coverage)
              4. Accessibility (contact info available, decision makers identified)
              5. Partnership Potential (collaboration opportunities, growth alignment)
              
              Return JSON with total score (0-100), factor breakdown, and brief explanation.`
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0].message.content;
      return content ? JSON.parse(content) : {
        score: 0,
        factors: {
          businessSize: 0,
          serviceCapability: 0,
          marketPresence: 0,
          accessibility: 0,
          partnershipPotential: 0
        },
        explanation: 'Scoring failed'
      };
    } catch (error) {
      logger.error('Lead scoring error', { error, lead });
      throw error;
    }
  }

  async generateOutreachMessage(lead: Lead, template: string): Promise<{
    subject: string;
    body: string;
    language: 'de' | 'en';
    tone: string;
  }> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert in Austrian B2B hospitality sales communication. 
            Create personalized outreach messages in German or English based on the business type.`
          },
          {
            role: 'user',
            content: `Create a personalized outreach message for this Austrian hospitality business:
              Lead: ${JSON.stringify(lead, null, 2)}
              Template: ${template}
              
              Requirements:
              - Professional but warm tone
              - Reference specific business details
              - Clear value proposition for interior design services
              - Appropriate language (German for local businesses, English for international chains)
              - Compelling subject line
              - GDPR-compliant footer
              
              Return JSON with subject, body, language, and tone description.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const content = completion.choices[0].message.content;
      
      if (content) {
        try {
          return JSON.parse(content);
        } catch {
          return {
            subject: 'Interior Design Services for Your Hotel',
            body: content,
            language: 'de',
            tone: 'professional'
          };
        }
      }
      
      throw new Error('No content generated');
    } catch (error) {
      logger.error('Outreach message generation error', { error, lead });
      throw error;
    }
  }

  async classifyBusinessType(description: string): Promise<{
    primaryType: 'INTERIOR_DESIGN' | 'HOTEL_OUTFITTER' | 'RESTAURANT_OUTFITTER' | 'LIGHTING_SPECIALIST' | 'FURNITURE_SUPPLIER' | 'KITCHEN_EQUIPMENT' | 'OTHER';
    subCategories: string[];
    confidence: number;
  }> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `Classify this Austrian hospitality outfitting company:
              "${description}"
              
              This is a B2B service provider that serves hotels and restaurants.
              
              Return JSON with:
              - primaryType: INTERIOR_DESIGN, HOTEL_OUTFITTER, RESTAURANT_OUTFITTER, LIGHTING_SPECIALIST, FURNITURE_SUPPLIER, KITCHEN_EQUIPMENT, or OTHER
              - subCategories: array of specific services (e.g., "luxury hotel design", "commercial furniture")
              - confidence: 0-100`
          }
        ],
        temperature: 0.1,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0].message.content;
      return content ? JSON.parse(content) : {
        primaryType: 'OTHER',
        subCategories: [],
        confidence: 0
      };
    } catch (error) {
      logger.error('Business classification error', { error, description });
      throw error;
    }
  }

  // NEW: GPT-4 Vision for hospitality project verification per Andy's feedback
  async analyzeHospitalityProjects(imageUrls: string[]): Promise<{
    hospitalityVerified: boolean;
    confidence: number;
    projectTypes: string[];
    explanation: string;
    genuineSupplierScore: number; // Anti-SEO stuffing score
  }> {
    try {
      const imageMessages = imageUrls.map(url => ({
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: `Analyze this project image to verify if it's genuine hospitality work (hotels, restaurants) vs residential/stock photos:` },
          { type: 'image_url' as const, image_url: { url } }
        ]
      }));

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert in hospitality interior design verification. Andy needs to distinguish genuine hospitality suppliers from SEO keyword stuffers.
            
            KEY REQUIREMENTS (per Andy's feedback):
            1. Look for COMMERCIAL hospitality features (reception desks, hotel lobbies, restaurant dining rooms, commercial kitchens)
            2. Distinguish from RESIDENTIAL projects (home living rooms, private bedrooms, house kitchens)
            3. Identify stock photos vs real project photos
            4. Score genuine supplier credibility (0-100) based on project authenticity
            
            HOSPITALITY INDICATORS:
            - Hotel reception/lobby areas
            - Restaurant dining rooms with commercial seating
            - Commercial bar setups
            - Hotel room interiors (multiple identical units)
            - Conference rooms/meeting spaces
            - Commercial lighting in hospitality settings
            - Professional kitchen equipment
            - Spa/wellness facilities
            
            RESIDENTIAL/FAKE INDICATORS:
            - Home living rooms, bedrooms, private kitchens
            - Single-family house interiors
            - Stock photography watermarks
            - Generic furniture catalog images
            - No commercial/business context`
          },
          ...imageMessages,
          {
            role: 'user',
            content: `Based on all images analyzed, return JSON with:
            - hospitalityVerified: boolean (true if genuine hospitality projects)
            - confidence: 0-100 (confidence in verification)
            - projectTypes: array of identified project types
            - explanation: why this is/isn't genuine hospitality work
            - genuineSupplierScore: 0-100 (anti-SEO stuffing score based on project authenticity)`
          }
        ],
        temperature: 0.2,
        max_tokens: 800,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0].message.content;
      return content ? JSON.parse(content) : {
        hospitalityVerified: false,
        confidence: 0,
        projectTypes: [],
        explanation: 'Analysis failed',
        genuineSupplierScore: 0
      };
    } catch (error) {
      logger.error('Image analysis error', { error, imageUrls });
      throw error;
    }
  }

  // Mobile number extraction from web content
  async extractMobileNumbers(webContent: string): Promise<{
    mobileNumbers: string[];
    confidence: number;
  }> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Extract Austrian mobile phone numbers from web content. Austrian mobile numbers start with +43 6xx, 0043 6xx, or 06xx.
            Look for mobile vs landline indicators (Handy, Mobil, mobile, cell phone context).`
          },
          {
            role: 'user',
            content: `Extract mobile phone numbers from this Austrian business website content:
            
            ${webContent}
            
            Return JSON with:
            - mobileNumbers: array of mobile numbers found (formatted as +43...)
            - confidence: 0-100 based on clear mobile indicators vs generic phone numbers`
          }
        ],
        temperature: 0.1,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0].message.content;
      return content ? JSON.parse(content) : {
        mobileNumbers: [],
        confidence: 0
      };
    } catch (error) {
      logger.error('Mobile extraction error', { error });
      throw error;
    }
  }
}