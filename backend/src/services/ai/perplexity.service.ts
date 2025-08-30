import axios from 'axios';
import logger from '../../utils/logger';

export class PerplexityService {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY!;
  }

  async searchCompanyInfo(companyName: string, location: string): Promise<{
    recentNews: Array<{ title: string; url: string; date: string; summary: string }>;
    recentProjects: Array<{ description: string; client: string; date: string; source: string }>;
    businessMetrics: Record<string, any>;
    competitorInfo: string[];
  }> {
    try {
      const _searchQuery = `"${companyName}" hoteleinrichtung OR hotelausstatter OR gastronomieeinrichtung "${location}" Austria`;
      
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'pplx-70b-online',
          messages: [
            {
              role: 'system',
              content: 'You are a business research assistant focused on Austrian hospitality outfitting industry. Research companies that provide services TO hotels and restaurants, not the hotels themselves.'
            },
            {
              role: 'user',
              content: `Research this Austrian hospitality outfitting company (B2B service provider):
                Company: ${companyName}
                Location: ${location}
                
                This company provides services TO hotels and restaurants (interior design, furniture, equipment, etc.).
                
                Find:
                1. Recent news, projects, or announcements (last 2 years)
                2. Hotel/restaurant projects they have completed
                3. Business performance and growth indicators
                4. Main competitors in the Austrian hospitality outfitting market
                5. Key clients or notable projects
                
                Format as JSON with sources.`
            }
          ],
          temperature: 0.2,
          max_tokens: 2000,
          return_citations: true
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch (parseError) {
        logger.warn('Failed to parse Perplexity response as JSON, extracting data', { parseError });
        
        return {
          recentNews: this.extractNews(content),
          recentProjects: this.extractProjects(content),
          businessMetrics: {},
          competitorInfo: this.extractCompetitors(content)
        };
      }
    } catch (error) {
      logger.error('Perplexity search error', { error, companyName, location });
      throw error;
    }
  }

  async findDecisionMakers(companyName: string, companyWebsite: string): Promise<Array<{
    name: string;
    position: string;
    linkedIn?: string;
    email?: string;
  }>> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'pplx-70b-online',
          messages: [
            {
              role: 'user',
              content: `Find key decision makers for this Austrian hospitality outfitting company:
                Company: ${companyName}
                Website: ${companyWebsite}
                
                Look for B2B service company roles:
                - CEO/Managing Director (Geschäftsführer)
                - Sales Director/Manager (Vertriebsleiter)
                - Project Manager (Projektleiter)
                - Interior Designer/Architect (Innenarchitekt)
                - Business Development Manager
                
                Include LinkedIn profiles if available.
                Format as JSON array.`
            }
          ],
          temperature: 0.1,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch {
        return [];
      }
    } catch (error) {
      logger.error('Decision maker search error', { error, companyName });
      return [];
    }
  }

  async verifyBusinessStatus(companyName: string, address: string): Promise<{
    isActive: boolean;
    verificationSource: string;
    lastVerified: string;
    additionalInfo: Record<string, any>;
  }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'pplx-70b-online',
          messages: [
            {
              role: 'user',
              content: `Verify if this Austrian business is currently active and operational:
                Name: ${companyName}
                Address: ${address}
                
                Check:
                - Current operational status
                - Recent online reviews or mentions
                - Business registry status if available
                - Any closure or bankruptcy notices
                
                Return JSON with verification details and sources.`
            }
          ],
          temperature: 0.1,
          max_tokens: 1000,
          return_citations: true
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch {
        return {
          isActive: true,
          verificationSource: 'Perplexity search',
          lastVerified: new Date().toISOString(),
          additionalInfo: { rawResponse: content }
        };
      }
    } catch (error) {
      logger.error('Business verification error', { error, companyName });
      throw error;
    }
  }

  private extractNews(content: string): Array<any> {
    const newsPattern = /news|announcement|press release/gi;
    const matches = content.match(newsPattern);
    return matches ? matches.slice(0, 5).map(match => ({
      title: match,
      url: '',
      date: new Date().toISOString(),
      summary: ''
    })) : [];
  }

  private extractProjects(content: string): Array<any> {
    const projectPattern = /renovation|expansion|remodeling|refurbishment/gi;
    const matches = content.match(projectPattern);
    return matches ? matches.slice(0, 3).map(match => ({
      description: match,
      date: new Date().toISOString(),
      source: 'Perplexity search'
    })) : [];
  }

  private extractCompetitors(content: string): string[] {
    const competitorPattern = /competitor|competing|rival/gi;
    const matches = content.match(competitorPattern);
    return matches ? matches.slice(0, 5) : [];
  }
}