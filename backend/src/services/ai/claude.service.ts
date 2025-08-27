import Anthropic from '@anthropic-ai/sdk';
import { logger } from '@utils/logger';
import { Lead, CompanyResearch } from '@/types';

export class ClaudeService {
  private client: Anthropic;
  private model = process.env.PRIMARY_AI_MODEL || 'claude-3-opus-20240229';

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }

  async researchCompany(lead: Partial<Lead>): Promise<CompanyResearch> {
    try {
      const prompt = `
        Research this Austrian hospitality outfitting company and extract relevant B2B information:
        
        Company: ${lead.companyName}
        Business Type: ${lead.type}
        Website: ${lead.website}
        Location: ${lead.city}, ${lead.region}
        
        This is a B2B service provider that OUTFITS and FURNISHES hotels and restaurants.
        Please provide:
        1. Company overview and service positioning
        2. Key services offered (interior design, furniture, lighting, etc.)
        3. Key decision makers and contacts (if publicly available)
        4. Employee count or company size
        5. Target hospitality segments (luxury hotels, restaurants, etc.)
        6. Recent projects or clients (if mentioned)
        7. Service radius and geographical coverage
        8. Certifications or industry memberships
        9. Minimum project sizes or budget ranges
        10. Portfolio strength and market reputation
        
        Format response as JSON with these fields:
        {
          overview: string,
          services: Array<string>,
          decisionMakers: Array<{name: string, role: string, email?: string}>,
          employeeCount: number | null,
          hospitalityFocus: Array<string>,
          recentProjects: Array<{client: string, description: string, year: number}>,
          serviceRadius: number | null,
          certifications: Array<string>,
          minimumProject: number | null,
          portfolioStrength: 'excellent' | 'good' | 'average' | 'limited',
          marketReputation: 'premium' | 'established' | 'growing' | 'unknown',
          businessHealth: 'growing' | 'stable' | 'declining',
          leadScore: number (0-100)
        }
      `;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        try {
          return JSON.parse(content.text);
        } catch (parseError) {
          logger.error('Failed to parse Claude response', { parseError, response: content.text });
          throw new Error('Invalid response format from Claude');
        }
      }
      
      throw new Error('Unexpected response type from Claude');
    } catch (error) {
      logger.error('Claude API error', { error, lead });
      throw error;
    }
  }

  async validateLeadQuality(lead: Lead): Promise<{
    isValid: boolean;
    score: number;
    reasons: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `
        Evaluate this Austrian hospitality outfitting company as a potential business partner/client:
        
        ${JSON.stringify(lead, null, 2)}
        
        This is a B2B evaluation for a company that provides services to hotels and restaurants.
        
        Validation criteria:
        - Company must be active and operational in Austria
        - Should serve the hospitality industry (hotels, restaurants, etc.)
        - Has potential for partnership or client relationship
        - Contact information available and GDPR compliant
        - Company size and project capacity suitable for collaboration
        - Geographic location allows for business relationship
        
        Return JSON with:
        {
          isValid: boolean,
          score: number (0-100),
          reasons: string[],
          recommendations: string[]
        }
      `;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1000,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return JSON.parse(content.text);
      }
      
      throw new Error('Unexpected response type from Claude');
    } catch (error) {
      logger.error('Lead validation error', { error, lead });
      throw error;
    }
  }

  async extractContactInfo(html: string, url: string): Promise<{
    emails: string[];
    phones: string[];
    addresses: string[];
    socialMedia: Record<string, string>;
  }> {
    try {
      const prompt = `
        Extract contact information from this website HTML:
        URL: ${url}
        
        Find and extract:
        - Email addresses
        - Phone numbers (Austrian format)
        - Physical addresses
        - Social media links
        
        Return only valid, unique results in JSON format:
        {
          emails: string[],
          phones: string[],
          addresses: string[],
          socialMedia: {platform: url}
        }
        
        HTML excerpt:
        ${html.substring(0, 10000)}
      `;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1000,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return JSON.parse(content.text);
      }
      
      throw new Error('Unexpected response type from Claude');
    } catch (error) {
      logger.error('Contact extraction error', { error, url });
      throw error;
    }
  }
}