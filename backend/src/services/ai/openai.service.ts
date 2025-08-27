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
        model: 'gpt-3.5-turbo',
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
}