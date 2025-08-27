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
            content: `You are an expert in Austrian hospitality industry analysis. 
            Enrich lead data with relevant business information, focusing on interior design and renovation opportunities.`
          },
          {
            role: 'user',
            content: `Analyze and enrich this Austrian hospitality business lead:
              ${JSON.stringify(lead, null, 2)}
              
              Provide additional insights on:
              1. Business category and positioning
              2. Likely budget range for renovations
              3. Typical renovation cycle for this type of business
              4. Key purchasing decision factors
              5. Seasonal patterns affecting renovation timing
              6. Regional market characteristics
              
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
      renovationLikelihood: number;
      budgetPotential: number;
      accessibility: number;
      timing: number;
    };
    explanation: string;
  }> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in B2B lead scoring for Austrian hospitality interior design market.'
          },
          {
            role: 'user',
            content: `Score this lead for interior design/outfitting services:
              ${JSON.stringify(lead, null, 2)}
              
              Scoring criteria (0-20 each):
              1. Business Size (rooms/seats, revenue)
              2. Renovation Likelihood (age, last renovation)
              3. Budget Potential (star rating, location, ownership)
              4. Accessibility (decision maker info available)
              5. Timing (current market conditions, seasonality)
              
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
          renovationLikelihood: 0,
          budgetPotential: 0,
          accessibility: 0,
          timing: 0
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
    primaryType: 'HOTEL' | 'RESTAURANT' | 'SPA' | 'VENUE' | 'OTHER';
    subCategories: string[];
    confidence: number;
  }> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Classify this Austrian hospitality business:
              "${description}"
              
              Return JSON with:
              - primaryType: HOTEL, RESTAURANT, SPA, VENUE, or OTHER
              - subCategories: array of specific categories (e.g., "boutique hotel", "fine dining")
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