import { Lead } from '@/types';
import { logger } from '@utils/logger';
import { 
  AUSTRIAN_SEARCH_TERMS,
  SEARCH_COMBINATIONS,
  GERMAN_NEGATIVE_KEYWORDS,
  AUSTRIAN_REGIONAL_SEARCH_TERMS,
  SEASONAL_AUSTRIAN_TERMS,
  AUSTRIAN_BUSINESS_CULTURE_TERMS
} from '../config/search-terms';
import { 
  OPTIMIZED_GERMAN_SEARCH_TERMS,
  GERMAN_SEARCH_COMBINATIONS
} from '../config/optimized-german-search-terms';

/**
 * German SEO Optimization Service
 * 
 * Implements Growth Hacker and Content Creator analysis for Austrian market:
 * - 98% German search language optimization
 * - €2.48B market with 75% competitor English gap
 * - Regional Austrian targeting (Wien, Salzburg, Innsbruck)
 * - Seasonal search pattern optimization (35% April spike)
 */
export class GermanSEOService {

  /**
   * Analyzes a lead for German SEO optimization opportunities
   * Based on Austrian market analysis and search behavior patterns
   */
  async analyzeGermanSEOPotential(lead: Partial<Lead>, webContent?: string): Promise<{
    seoQualityScore: number;
    germanSearchTerms: string[];
    austrianRegion: 'wien' | 'salzburg' | 'innsbruck' | 'graz' | 'linz' | 'other';
    searchLanguage: 'german' | 'english' | 'mixed';
    regionalFocus: string[];
    seasonalRelevance: 'april_renovation' | 'new_opening' | 'tourism_prep' | 'general';
    recommendations: string[];
    marketOpportunity: number; // 0-100 based on German SEO potential
  }> {
    try {
      const analysis = {
        seoQualityScore: 0,
        germanSearchTerms: [] as string[],
        austrianRegion: this.detectAustrianRegion(lead),
        searchLanguage: this.detectSearchLanguage(lead, webContent || ''),
        regionalFocus: [] as string[],
        seasonalRelevance: this.detectSeasonalRelevance(lead, webContent || ''),
        recommendations: [] as string[],
        marketOpportunity: 0
      };

      // Analyze German keyword potential
      const keywordAnalysis = this.analyzeGermanKeywords(lead, webContent || '');
      analysis.germanSearchTerms = keywordAnalysis.foundTerms;
      analysis.seoQualityScore += keywordAnalysis.score * 0.4; // 40% weight

      // Regional optimization potential
      const regionalAnalysis = this.analyzeRegionalOptimization(lead);
      analysis.regionalFocus = regionalAnalysis.regions;
      analysis.seoQualityScore += regionalAnalysis.score * 0.3; // 30% weight

      // Austrian business culture alignment
      const cultureAnalysis = this.analyzeAustrianBusinessCulture(lead, webContent || '');
      analysis.seoQualityScore += cultureAnalysis.score * 0.2; // 20% weight

      // Lighting specialist bonus (Andy's priority market)
      const lightingBonus = this.analyzeLightingSpecialistPotential(lead);
      analysis.seoQualityScore += lightingBonus * 0.1; // 10% weight

      // Generate recommendations
      analysis.recommendations = this.generateSEORecommendations(analysis, lead);
      
      // Calculate market opportunity (Blue Ocean potential)
      analysis.marketOpportunity = this.calculateMarketOpportunity(analysis);

      return analysis;

    } catch (error) {
      logger.error('German SEO analysis error', { error, lead });
      return {
        seoQualityScore: 0,
        germanSearchTerms: [],
        austrianRegion: 'other' as const,
        searchLanguage: 'german' as const,
        regionalFocus: [],
        seasonalRelevance: 'general' as const,
        recommendations: ['SEO analysis failed - manual review required'],
        marketOpportunity: 0
      };
    }
  }

  /**
   * Detects Austrian region based on company location
   * Maps to Content Creator regional strategy (Wien 40%, Salzburg 25%, etc.)
   */
  private detectAustrianRegion(lead: Partial<Lead>): 'wien' | 'salzburg' | 'innsbruck' | 'graz' | 'linz' | 'other' {
    const location = (lead.city || '').toLowerCase();
    const address = (lead.address || '').toLowerCase();
    const region = (lead.region || '').toLowerCase();

    if (location.includes('wien') || location.includes('vienna') || region.includes('wien')) {
      return 'wien';
    }
    if (location.includes('salzburg') || address.includes('salzburg')) {
      return 'salzburg';
    }
    if (location.includes('innsbruck') || region.includes('tirol')) {
      return 'innsbruck';
    }
    if (location.includes('graz') || region.includes('steiermark')) {
      return 'graz';
    }
    if (location.includes('linz') || region.includes('oberösterreich')) {
      return 'linz';
    }
    
    return 'other';
  }

  /**
   * Detects search language preference based on content analysis
   * Critical for 98% German search optimization
   */
  private detectSearchLanguage(lead: Partial<Lead>, webContent: string): 'german' | 'english' | 'mixed' {
    const content = `${lead.companyName || ''} ${webContent}`.toLowerCase();
    
    const germanIndicators = [
      'österreich', 'deutschland', 'schweiz',
      'hotel', 'restaurant', 'gastronomie',
      'einrichtung', 'ausstattung', 'möbel',
      'lichtplanung', 'innenarchitektur'
    ];

    const englishIndicators = [
      'hospitality', 'interior design', 'furniture',
      'lighting design', 'hotel outfitting',
      'restaurant design', 'contract furniture'
    ];

    const germanCount = germanIndicators.filter(term => content.includes(term)).length;
    const englishCount = englishIndicators.filter(term => content.includes(term)).length;

    if (germanCount > englishCount * 2) return 'german';
    if (englishCount > germanCount * 2) return 'english';
    return 'mixed';
  }

  /**
   * Detects seasonal relevance for Content Creator 35% April spike strategy
   */
  private detectSeasonalRelevance(lead: Partial<Lead>, webContent: string): 'april_renovation' | 'new_opening' | 'tourism_prep' | 'general' {
    const content = webContent.toLowerCase();
    
    if (content.includes('renovation') || content.includes('umbau') || content.includes('sanierung')) {
      return 'april_renovation';
    }
    if (content.includes('neueröffnung') || content.includes('new opening') || content.includes('startup')) {
      return 'new_opening';
    }
    if (content.includes('saison') || content.includes('tourismus') || content.includes('ski')) {
      return 'tourism_prep';
    }
    
    return 'general';
  }

  /**
   * Analyzes German keyword potential vs current English terms
   * Based on Growth Hacker 300%+ improvement analysis
   */
  private analyzeGermanKeywords(lead: Partial<Lead>, webContent: string): {
    foundTerms: string[];
    score: number;
  } {
    const content = `${lead.companyName || ''} ${webContent}`.toLowerCase();
    const foundTerms: string[] = [];
    let score = 0;

    // Check primary German commercial terms (high value)
    OPTIMIZED_GERMAN_SEARCH_TERMS.PRIMARY_COMMERCIAL.forEach(term => {
      if (this.contentMatchesTerm(content, term)) {
        foundTerms.push(term);
        score += 15; // High value terms
      }
    });

    // Check long-tail German opportunities (Growth Hacker gold)
    OPTIMIZED_GERMAN_SEARCH_TERMS.LONG_TAIL_COMMERCIAL.forEach(term => {
      if (this.contentMatchesTerm(content, term)) {
        foundTerms.push(term);
        score += 25; // Very high value - low competition
      }
    });

    // Andy's lighting specialist terms (premium scoring)
    OPTIMIZED_GERMAN_SEARCH_TERMS.LIGHTING_SPECIALISTS.forEach(term => {
      if (this.contentMatchesTerm(content, term)) {
        foundTerms.push(term);
        score += 20; // Andy's priority market
      }
    });

    return {
      foundTerms: foundTerms.slice(0, 10), // Top 10 most relevant
      score: Math.min(100, score)
    };
  }

  /**
   * Analyzes regional optimization opportunities
   * Wien (40% market), Salzburg (25% luxury), Innsbruck (20% alpine)
   */
  private analyzeRegionalOptimization(lead: Partial<Lead>): {
    regions: string[];
    score: number;
  } {
    const regions: string[] = [];
    let score = 0;

    const region = this.detectAustrianRegion(lead);
    
    switch (region) {
      case 'wien':
        regions.push('wien', 'vienna', 'business capital');
        score = 90; // Highest market potential
        break;
      case 'salzburg':
        regions.push('salzburg', 'tourism hub', 'luxury market');
        score = 80; // Premium tourism market
        break;
      case 'innsbruck':
        regions.push('innsbruck', 'tirol', 'alpine hospitality');
        score = 70; // Specialized mountain market
        break;
      case 'graz':
        regions.push('graz', 'steiermark');
        score = 60; // Regional business center
        break;
      case 'linz':
        regions.push('linz', 'oberösterreich');
        score = 50; // Industrial business center
        break;
      default:
        regions.push('austria', 'österreich');
        score = 40; // General Austrian market
    }

    return { regions, score };
  }

  /**
   * Analyzes Austrian business culture alignment (Gemütlichkeit principle)
   */
  private analyzeAustrianBusinessCulture(lead: Partial<Lead>, webContent: string): {
    score: number;
  } {
    const content = `${lead.companyName || ''} ${webContent}`.toLowerCase();
    let score = 0;

    // Austrian quality and craftsmanship indicators
    const qualityTerms = [
      'qualität', 'handwerk', 'tradition', 'österreichisch',
      'gemütlich', 'atmosphäre', 'nachhaltig', 'regional'
    ];

    qualityTerms.forEach(term => {
      if (content.includes(term)) {
        score += 10;
      }
    });

    // Austrian business terms
    if (content.includes('gmbh') || content.includes('kg') || content.includes('og')) {
      score += 15; // Austrian legal structure
    }

    return { score: Math.min(100, score) };
  }

  /**
   * Andy's lighting specialist market opportunity analysis
   * Premium scoring for Andy's lamp business priorities
   */
  private analyzeLightingSpecialistPotential(lead: Partial<Lead>): number {
    if (lead.type === 'LIGHTING_SPECIALIST') {
      return 100; // Perfect match for Andy's market
    }

    const content = `${lead.companyName || ''} ${lead.specializations?.join(' ') || ''}`.toLowerCase();
    
    if (content.includes('licht') || content.includes('beleuchtung') || content.includes('lighting')) {
      return 80; // High relevance for Andy
    }

    if (content.includes('innenarchitektur') && content.includes('hotel')) {
      return 60; // Interior designers who might specify lighting
    }

    return 0;
  }

  /**
   * Helper method to match content against German search terms
   */
  private contentMatchesTerm(content: string, term: string): boolean {
    const termWords = term.toLowerCase().split(' ');
    return termWords.every(word => content.includes(word));
  }

  /**
   * Generates SEO recommendations based on analysis
   */
  private generateSEORecommendations(analysis: any, lead: Partial<Lead>): string[] {
    const recommendations: string[] = [];

    if (analysis.searchLanguage !== 'german') {
      recommendations.push('Optimize for German search terms - 98% of Austrian searches are in German');
    }

    if (analysis.regionalFocus.length === 0) {
      recommendations.push('Add Austrian regional targeting for better local search visibility');
    }

    if (analysis.seoQualityScore < 50) {
      recommendations.push('Improve German keyword density and Austrian business culture alignment');
    }

    if (lead.type === 'LIGHTING_SPECIALIST') {
      recommendations.push('HIGH PRIORITY: Perfect match for Andy\'s lighting market - immediate contact recommended');
    }

    if (analysis.austrianRegion === 'wien') {
      recommendations.push('Wien market: Focus on business sophistication and international appeal');
    } else if (analysis.austrianRegion === 'salzburg') {
      recommendations.push('Salzburg market: Emphasize luxury tourism and cultural heritage');
    }

    return recommendations;
  }

  /**
   * Calculates market opportunity based on Blue Ocean analysis
   * €2.48B market with 75% competitor gap
   */
  private calculateMarketOpportunity(analysis: any): number {
    let opportunity = 0;

    // German search optimization (base opportunity)
    if (analysis.searchLanguage === 'german') {
      opportunity += 40; // Matches 98% of Austrian searches
    }

    // Regional optimization bonus
    if (analysis.austrianRegion === 'wien') {
      opportunity += 30; // 40% of market
    } else if (analysis.austrianRegion === 'salzburg') {
      opportunity += 25; // 25% luxury market
    } else if (analysis.austrianRegion === 'innsbruck') {
      opportunity += 20; // 20% alpine market
    } else {
      opportunity += 15; // Other regions
    }

    // Long-tail opportunity (Growth Hacker insight)
    if (analysis.germanSearchTerms.length > 5) {
      opportunity += 20; // Multiple keyword opportunities
    }

    // Seasonal optimization potential
    if (analysis.seasonalRelevance === 'april_renovation') {
      opportunity += 10; // 35% April search spike
    }

    return Math.min(100, opportunity);
  }

  /**
   * Gets optimal German search terms for a specific business type and region
   * Used for content optimization and N8N workflow configuration
   */
  async getOptimalSearchTermsForLead(lead: Partial<Lead>): Promise<{
    primaryTerms: string[];
    longTailTerms: string[];
    regionalTerms: string[];
    negativeKeywords: string[];
  }> {
    const region = this.detectAustrianRegion(lead);
    const businessType = lead.type || 'OTHER';

    const result = {
      primaryTerms: [] as string[],
      longTailTerms: [] as string[],
      regionalTerms: [] as string[],
      negativeKeywords: GERMAN_NEGATIVE_KEYWORDS
    };

    // Get primary terms based on business type
    switch (businessType) {
      case 'LIGHTING_SPECIALIST':
        result.primaryTerms = OPTIMIZED_GERMAN_SEARCH_TERMS.LIGHTING_SPECIALISTS.slice(0, 5);
        break;
      case 'INTERIOR_DESIGN':
        result.primaryTerms = OPTIMIZED_GERMAN_SEARCH_TERMS.INTERIOR_DESIGN_GERMAN.slice(0, 5);
        break;
      case 'FURNITURE_SUPPLIER':
        result.primaryTerms = OPTIMIZED_GERMAN_SEARCH_TERMS.FURNITURE_SUPPLIERS_GERMAN.slice(0, 5);
        break;
      default:
        result.primaryTerms = OPTIMIZED_GERMAN_SEARCH_TERMS.PRIMARY_COMMERCIAL.slice(0, 5);
    }

    // Add long-tail opportunities
    result.longTailTerms = OPTIMIZED_GERMAN_SEARCH_TERMS.LONG_TAIL_COMMERCIAL.slice(0, 3);

    // Add regional terms
    switch (region) {
      case 'wien':
        result.regionalTerms = AUSTRIAN_REGIONAL_SEARCH_TERMS.VIENNA.slice(0, 4);
        break;
      case 'salzburg':
        result.regionalTerms = AUSTRIAN_REGIONAL_SEARCH_TERMS.SALZBURG.slice(0, 4);
        break;
      case 'innsbruck':
        result.regionalTerms = AUSTRIAN_REGIONAL_SEARCH_TERMS.INNSBRUCK_TIROL.slice(0, 4);
        break;
      default:
        result.regionalTerms = AUSTRIAN_REGIONAL_SEARCH_TERMS.OTHER_REGIONS.slice(0, 4);
    }

    return result;
  }
}