import { ClaudeService } from '../../../backend/src/services/ai/claude.service';
import { Lead } from '../../../data/schemas/zod-schemas';

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk');

describe('ClaudeService', () => {
  let claudeService: ClaudeService;
  let mockAnthropicClient: any;

  beforeEach(() => {
    mockAnthropicClient = {
      messages: {
        create: jest.fn(),
      },
    };
    
    (require('@anthropic-ai/sdk') as jest.Mock).mockImplementation(() => mockAnthropicClient);
    claudeService = new ClaudeService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('researchCompany', () => {
    const mockLead = {
      companyName: 'Hotel Alpenhof',
      type: 'HOTEL' as const,
      website: 'https://hotel-alpenhof.at',
      city: 'Innsbruck',
      region: 'Tirol',
    };

    it('should successfully research a company', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: JSON.stringify({
            overview: 'Luxury 4-star hotel in Innsbruck',
            lastRenovation: '2020',
            decisionMakers: [
              { name: 'Johann Mueller', role: 'General Manager' }
            ],
            capacity: 120,
            targetSegment: 'Business travelers and tourists',
            plannedRenovations: true,
            ownershipType: 'independent',
            designStyle: 'Alpine modern',
            businessHealth: 'growing',
            leadScore: 85
          })
        }]
      };

      mockAnthropicClient.messages.create.mockResolvedValue(mockResponse);

      const result = await claudeService.researchCompany(mockLead);

      expect(result).toMatchObject({
        overview: 'Luxury 4-star hotel in Innsbruck',
        lastRenovation: '2020',
        leadScore: 85,
      });

      expect(mockAnthropicClient.messages.create).toHaveBeenCalledWith({
        model: expect.any(String),
        max_tokens: 2000,
        temperature: 0.3,
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Hotel Alpenhof'),
          })
        ]),
      });
    });

    it('should handle API errors gracefully', async () => {
      mockAnthropicClient.messages.create.mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      await expect(claudeService.researchCompany(mockLead)).rejects.toThrow(
        'API rate limit exceeded'
      );
    });

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: 'Invalid JSON response'
        }]
      };

      mockAnthropicClient.messages.create.mockResolvedValue(mockResponse);

      await expect(claudeService.researchCompany(mockLead)).rejects.toThrow(
        'Invalid response format from Claude'
      );
    });
  });

  describe('validateLeadQuality', () => {
    const mockLead: Lead = {
      id: 'test-lead-1',
      companyName: 'Restaurant Steirereck',
      type: 'RESTAURANT',
      city: 'Wien',
      region: 'Wien',
      category: 'fine dining',
      website: 'https://steirereck.at',
      email: 'info@steirereck.at',
      phone: '+431713315168',
      capacity: 80,
      status: 'NEW',
      score: 0,
      renovationPlanned: false,
      source: 'manual_entry',
      gdprConsent: true,
    } as Lead;

    it('should validate lead quality successfully', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: JSON.stringify({
            isValid: true,
            score: 90,
            reasons: [
              'Established fine dining restaurant',
              'High-end location in Vienna',
              'Strong online presence'
            ],
            recommendations: [
              'Contact during off-season for renovation planning',
              'Highlight luxury interior design portfolio'
            ]
          })
        }]
      };

      mockAnthropicClient.messages.create.mockResolvedValue(mockResponse);

      const result = await claudeService.validateLeadQuality(mockLead);

      expect(result).toMatchObject({
        isValid: true,
        score: 90,
        reasons: expect.arrayContaining([
          expect.stringContaining('fine dining')
        ]),
        recommendations: expect.any(Array),
      });
    });
  });

  describe('extractContactInfo', () => {
    const mockHtml = `
      <html>
        <body>
          <div class="contact">
            <p>Email: office@hotel-example.at</p>
            <p>Phone: +43 512 123456</p>
            <p>Address: Hauptstraße 1, 6020 Innsbruck</p>
            <a href="https://facebook.com/hotelexample">Facebook</a>
            <a href="https://instagram.com/hotelexample">Instagram</a>
          </div>
        </body>
      </html>
    `;
    const mockUrl = 'https://hotel-example.at';

    it('should extract contact information from HTML', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: JSON.stringify({
            emails: ['office@hotel-example.at'],
            phones: ['+43 512 123456'],
            addresses: ['Hauptstraße 1, 6020 Innsbruck'],
            socialMedia: {
              facebook: 'https://facebook.com/hotelexample',
              instagram: 'https://instagram.com/hotelexample'
            }
          })
        }]
      };

      mockAnthropicClient.messages.create.mockResolvedValue(mockResponse);

      const result = await claudeService.extractContactInfo(mockHtml, mockUrl);

      expect(result).toMatchObject({
        emails: ['office@hotel-example.at'],
        phones: ['+43 512 123456'],
        addresses: ['Hauptstraße 1, 6020 Innsbruck'],
        socialMedia: {
          facebook: 'https://facebook.com/hotelexample',
          instagram: 'https://instagram.com/hotelexample'
        }
      });

      expect(mockAnthropicClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: expect.any(String),
          max_tokens: 1000,
          temperature: 0.1,
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining(mockUrl),
            })
          ]),
        })
      );
    });

    it('should handle empty HTML gracefully', async () => {
      const emptyHtml = '<html><body></body></html>';
      
      const mockResponse = {
        content: [{
          type: 'text',
          text: JSON.stringify({
            emails: [],
            phones: [],
            addresses: [],
            socialMedia: {}
          })
        }]
      };

      mockAnthropicClient.messages.create.mockResolvedValue(mockResponse);

      const result = await claudeService.extractContactInfo(emptyHtml, mockUrl);

      expect(result).toEqual({
        emails: [],
        phones: [],
        addresses: [],
        socialMedia: {}
      });
    });
  });
});