import { Lead } from '@/types';
import { logger } from '@utils/logger';

type QualityFactors = {
  contentAuthenticity: number;
  businessCredibility: number;
  hospitalitySpecialization: number;
  contactTransparency: number;
  projectPortfolio: number;
};

type GenuineSupplierResult = {
  genuineSupplierScore: number;
  qualityFactors: QualityFactors;
  redFlags: string[];
  recommendations: string[];
};

export class FilteringService {
  
  // Main filtering service per Andy's anti-SEO requirements
  async scoreGenuineSupplier(
    lead: Partial<Lead>,
    webContent?: string,
    projectImages?: string[]
  ): Promise<GenuineSupplierResult> {
    try {
      const factors = {
        contentAuthenticity: await this.scoreContentAuthenticity(webContent || ''),
        businessCredibility: await this.scoreBusinessCredibility(lead),
        hospitalitySpecialization: await this.scoreHospitalitySpecialization(lead, webContent || ''),
        contactTransparency: await this.scoreContactTransparency(lead),
        projectPortfolio: await this.scoreProjectPortfolio(projectImages || [])
      };

      const redFlags = this.identifyRedFlags(lead, webContent || '');
      const recommendations = this.generateRecommendations(factors, redFlags);

      // Weighted scoring based on Andy's priorities
      const genuineSupplierScore = Math.round(
        factors.contentAuthenticity * 0.25 +      // 25% - Real vs SEO content
        factors.businessCredibility * 0.20 +      // 20% - Legitimate business
        factors.hospitalitySpecialization * 0.25 + // 25% - True hospitality focus
        factors.contactTransparency * 0.15 +      // 15% - Real contact info
        factors.projectPortfolio * 0.15           // 15% - Genuine projects
      );

      return {
        genuineSupplierScore,
        qualityFactors: factors,
        redFlags,
        recommendations
      };

    } catch (error) {
      logger.error('Genuine supplier scoring error', { error, lead });
      return {
        genuineSupplierScore: 0,
        qualityFactors: {
          contentAuthenticity: 0,
          businessCredibility: 0,
          hospitalitySpecialization: 0,
          contactTransparency: 0,
          projectPortfolio: 0
        },
        redFlags: ['Scoring failed'],
        recommendations: []
      };
    }
  }

  private async scoreContentAuthenticity(webContent: string): Promise<number> {
    let score = 0;

    // Positive indicators (genuine business content)
    const genuineIndicators = [
      /über uns/i, /unser team/i, /our team/i,
      /projekte/i, /referenzen/i, /portfolio/i,
      /kontakt/i, /impressum/i,
      /jahre erfahrung/i, /seit \d{4}/i,
      /zertifikat/i, /auszeichnung/i,
      /mitarbeiter/i, /angestellte/i
    ];

    // SEO stuffing red flags
    const seoRedFlags = [
      /hotel.*restaurant.*design.*furniture.*lighting/i, // Keyword stuffing
      /best.*top.*leading.*premium.*luxury.*exclusive/i,  // SEO superlatives
      /seo.*marketing.*online.*digital.*web.*agency/i,    // SEO company
      /lorem ipsum/i,                                      // Placeholder text
      /keyword/i, /backlink/i,                            // SEO terms
    ];

    // Score genuine content
    genuineIndicators.forEach(regex => {
      if (regex.test(webContent)) score += 8;
    });

    // Penalize SEO stuffing
    seoRedFlags.forEach(regex => {
      if (regex.test(webContent)) score -= 15;
    });

    // Content depth analysis
    const wordCount = webContent.split(/\s+/).length;
    if (wordCount > 500) score += 10;      // Substantial content
    if (wordCount < 100) score -= 20;     // Thin content

    return Math.max(0, Math.min(100, score + 50)); // Normalize to 0-100
  }

  private async scoreBusinessCredibility(lead: Partial<Lead>): Promise<number> {
    let score = 0;

    // Austrian business registry (UID) verification
    if (lead.uid && /^ATU\d{8}$/.test(lead.uid)) {
      score += 25; // Valid Austrian UID is strong indicator
    }

    // Business establishment
    if (lead.yearEstablished) {
      const yearsInBusiness = new Date().getFullYear() - lead.yearEstablished;
      if (yearsInBusiness >= 10) score += 20;
      else if (yearsInBusiness >= 5) score += 15;
      else if (yearsInBusiness >= 2) score += 10;
    }

    // Employee count (real businesses have staff)
    if (lead.employeeCount) {
      if (lead.employeeCount >= 10) score += 15;
      else if (lead.employeeCount >= 5) score += 10;
      else if (lead.employeeCount >= 2) score += 5;
    }

    // Complete contact information
    if (lead.address && lead.phone) score += 15;
    if (lead.email) score += 10;

    // Professional website structure
    if (lead.website && !lead.website.includes('wordpress.com') && !lead.website.includes('wix.com')) {
      score += 10;
    }

    return Math.min(100, score);
  }

  private async scoreHospitalitySpecialization(lead: Partial<Lead>, webContent: string): Promise<number> {
    let score = 0;

    // Hospitality-specific terms (Andy's requirement for "hospitality" keyword)
    const hospitalityTerms = [
      /hospitality/i, /hotellerie/i,
      /hotel.*design/i, /hotel.*einrichtung/i, /hotel.*ausstatter/i,
      /restaurant.*design/i, /restaurant.*einrichtung/i,
      /gastronomie.*einrichtung/i, /gastronomy/i,
      /commercial.*interior/i, /gewerblich.*innenarchitektur/i,
      /ff&e/i, // Furniture, Fixtures & Equipment
      /contract.*furniture/i, /objektmöbel/i
    ];

    // Count hospitality specialization mentions
    let hospitalityMentions = 0;
    hospitalityTerms.forEach(term => {
      const matches = webContent.match(new RegExp(term.source, 'gi'));
      if (matches) {
        hospitalityMentions += matches.length;
        score += Math.min(10, matches.length * 2); // Max 10 points per term type
      }
    });

    // Business type alignment
    const hospitalityBusinessTypes = [
      'INTERIOR_DESIGN', 'HOTEL_OUTFITTER', 'RESTAURANT_OUTFITTER', 
      'LIGHTING_SPECIALIST', 'FURNITURE_SUPPLIER'
    ];
    
    if (lead.type && hospitalityBusinessTypes.includes(lead.type)) {
      score += 20;
    }

    // Specialization arrays
    if (lead.specializations && lead.specializations.length > 0) {
      score += Math.min(15, lead.specializations.length * 3);
    }

    // Hospitality focus
    if (lead.hospitalityFocus && lead.hospitalityFocus.length > 0) {
      score += Math.min(20, lead.hospitalityFocus.length * 5);
    }

    return Math.min(100, score);
  }

  private async scoreContactTransparency(lead: Partial<Lead>): Promise<number> {
    let score = 0;

    // Email transparency (not generic)
    if (lead.email) {
      if (lead.email.includes('info@') || lead.email.includes('office@') || 
          lead.email.includes('kontakt@')) {
        score += 15; // Professional email
      } else if (!lead.email.includes('gmail.com') && !lead.email.includes('yahoo.com')) {
        score += 20; // Business domain email
      }
    }

    // Phone number quality
    if (lead.phone) {
      score += 15;
      // Austrian landline vs mobile distinction
      if (lead.phone.includes('+43 1') || lead.phone.includes('01 ')) {
        score += 5; // Vienna landline (business)
      }
    }

    // Mobile number (Andy's priority)
    if (lead.mobile) {
      score += 20; // Mobile is crucial per Andy
    }

    // Physical address
    if (lead.address && lead.city && lead.postalCode) {
      score += 25; // Complete address shows transparency
    }

    // Website match with company name
    if (lead.website && lead.companyName) {
      const websiteDomain = lead.website.toLowerCase();
      const companyWords = lead.companyName.toLowerCase().split(/\s+/);
      const hasNameMatch = companyWords.some(word => 
        word.length > 3 && websiteDomain.includes(word)
      );
      if (hasNameMatch) score += 15;
    }

    return Math.min(100, score);
  }

  private async scoreProjectPortfolio(projectImages: string[]): Promise<number> {
    let score = 0;

    // Basic portfolio presence
    if (projectImages.length === 0) {
      return 10; // No portfolio images to analyze
    }

    if (projectImages.length >= 5) score += 20;
    else if (projectImages.length >= 3) score += 15;
    else if (projectImages.length >= 1) score += 10;

    // Quality indicators (would need image analysis for full implementation)
    // This is a placeholder - the actual GPT-4 Vision analysis would provide the real score
    const averageImageScore = 60; // Placeholder
    score += Math.round(averageImageScore * 0.6); // 60% weight from image analysis

    return Math.min(100, score);
  }

  private identifyRedFlags(lead: Partial<Lead>, webContent: string): string[] {
    const redFlags: string[] = [];

    // SEO company masquerading as hospitality business
    if (/seo.*agentur|web.*agentur|marketing.*agentur/i.test(webContent)) {
      redFlags.push('Appears to be SEO/Marketing agency, not genuine hospitality supplier');
    }

    // Keyword stuffing in company name
    if (lead.companyName && lead.companyName.split(/\s+/).length > 8) {
      redFlags.push('Company name contains excessive keywords (possible SEO stuffing)');
    }

    // Generic contact info
    if (lead.email && /info@|contact@|office@/i.test(lead.email) && 
        !lead.phone && !lead.address) {
      redFlags.push('Only generic contact info available');
    }

    // Suspiciously broad services
    const serviceKeywords = (webContent.match(/hotel|restaurant|design|furniture|lighting|kitchen|textile|flooring/gi) || []).length;
    if (serviceKeywords > 15) {
      redFlags.push('Claims expertise in too many unrelated areas');
    }

    // No Austrian business indicators
    if (!lead.uid && !lead.address && !lead.postalCode) {
      redFlags.push('No verifiable Austrian business registration or address');
    }

    // Recent domain registration (would need web analysis)
    // This is a placeholder for more sophisticated checks

    return redFlags;
  }

  private generateRecommendations(factors: QualityFactors, redFlags: string[]): string[] {
    const recommendations: string[] = [];

    if (factors.contactTransparency < 50) {
      recommendations.push('Verify contact information before outreach');
    }

    if (factors.hospitalitySpecialization < 40) {
      recommendations.push('Confirm genuine hospitality focus through portfolio review');
    }

    if (factors.businessCredibility < 60) {
      recommendations.push('Validate Austrian business registration (UID)');
    }

    if (redFlags.length > 2) {
      recommendations.push('High risk lead - requires manual verification before contact');
    }

    if (factors.contentAuthenticity < 30) {
      recommendations.push('Possible SEO-optimized site - verify genuine business operations');
    }

    return recommendations;
  }
}