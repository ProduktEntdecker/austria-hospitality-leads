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
        Research this Austrian hospitality business and extract relevant information:
        
        Company: ${lead.companyName}
        Type: ${lead.type}
        Website: ${lead.website}
        Location: ${lead.city}, ${lead.region}
        
        Please provide:
        1. Business overview and positioning
        2. Recent renovations or expansions (last 5 years)
        3. Key decision makers (if publicly available)
        4. Estimated capacity (rooms/seats)
        5. Target customer segment
        6. Any planned renovations or changes
        7. Ownership structure (chain/independent)
        8. Interior design style/theme
        
        Format response as JSON with these fields:
        {
          overview: string,
          lastRenovation: string | null,
          decisionMakers: Array<{name: string, role: string}>,
          capacity: number | null,
          targetSegment: string,
          plannedRenovations: boolean,
          ownershipType: string,
          designStyle: string,
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
        Evaluate this lead for Austrian hotel/restaurant interior design services:
        
        ${JSON.stringify(lead, null, 2)}
        
        Criteria:
        - Business must be active and operational
        - Should have renovation potential (age, last renovation date)
        - Budget indicators (star rating, location, size)
        - Decision-making accessibility
        - GDPR compliance for contact
        
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