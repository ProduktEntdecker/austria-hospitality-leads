import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// Demo authentication schema
const DemoLoginSchema = z.object({
  demoPassword: z.string().min(1, 'Demo password required'),
});

// Demo session interface
interface DemoSession {
  authenticated: boolean;
  expiresAt: number;
  userId: string;
  permissions: string[];
}

/**
 * POST /api/demo/login
 * Authenticate demo user
 */
router.post('/login', (req: Request, res: Response) => {
  try {
    const { demoPassword } = DemoLoginSchema.parse(req.body);
    
    // Check if demo mode is enabled
    if (process.env.DEMO_MODE !== 'true') {
      return res.status(403).json({
        success: false,
        error: 'Demo mode is not enabled'
      });
    }
    
    // Validate demo password
    const validPassword = process.env.DEMO_PASSWORD || 'AndyDemo2025!';
    if (demoPassword !== validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid demo password'
      });
    }
    
    // Create demo session
    const session: DemoSession = {
      authenticated: true,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      userId: 'demo-andy',
      permissions: ['read', 'demo', 'settings']
    };
    
    // Set session cookie (if using express-session)
    if (req.session) {
      req.session.demo = session;
    }
    
    res.json({
      success: true,
      message: 'Demo access granted',
      session: {
        expiresAt: session.expiresAt,
        permissions: session.permissions
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid request format',
        details: error.errors
      });
    } else {
      console.error('Demo login error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  }
});

/**
 * GET /api/demo/status
 * Check demo session status
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const session = req.session?.demo as DemoSession | undefined;
    
    if (!session || !session.authenticated) {
      return res.json({
        success: true,
        authenticated: false
      });
    }
    
    // Check if session expired
    if (Date.now() > session.expiresAt) {
      // Clear expired session
      if (req.session?.demo) {
        delete req.session.demo;
      }
      
      return res.json({
        success: true,
        authenticated: false,
        expired: true
      });
    }
    
    res.json({
      success: true,
      authenticated: true,
      expiresAt: session.expiresAt,
      permissions: session.permissions,
      userId: session.userId
    });
    
  } catch (error) {
    console.error('Demo status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Status check failed'
    });
  }
});

/**
 * POST /api/demo/logout
 * End demo session
 */
router.post('/logout', (req: Request, res: Response) => {
  try {
    // Clear demo session
    if (req.session?.demo) {
      delete req.session.demo;
    }
    
    res.json({
      success: true,
      message: 'Demo session ended'
    });
    
  } catch (error) {
    console.error('Demo logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

/**
 * GET /api/demo/data
 * Get sample Austrian hospitality companies for demo
 */
router.get('/data', demoAuthMiddleware, (req: Request, res: Response) => {
  try {
    const demoCompanies = [
      {
        id: 'demo-1',
        name: 'lichtwert concept GmbH',
        description: 'Premium hotel lighting design specialists',
        location: {
          city: 'Salzburg',
          region: 'Salzburg',
          country: 'Austria'
        },
        contact: {
          phone: '+43 662 265718',
          mobile: '+43 664 789 1234',
          email: 'office@lichtwert-concept.com',
          website: 'https://lichtwert-concept.com'
        },
        scoring: {
          overall: 92,
          genuineSupplier: 95,
          hospitalityFocus: 88,
          businessCredibility: 90,
          contactTransparency: 94
        },
        specializations: [
          'Hotel Lighting Design',
          'Restaurant Ambiance',
          'Luxury Interior Illumination'
        ],
        projects: [
          'Hotel Sacher Wien - Lighting Renovation',
          'Restaurant Steirereck - Ambient Design',
          'Hotel Goldener Hirsch - Heritage Lighting'
        ],
        searchTermsFound: [
          'hotelbeleuchtung österreich',
          'restaurant licht design salzburg',
          'luxus hotel einrichtung'
        ],
        discovered: new Date().toISOString(),
        confidence: 0.92
      },
      {
        id: 'demo-2',
        name: 'destilat Design Studio GmbH',
        description: 'Contemporary restaurant and hotel interior design',
        location: {
          city: 'Wien',
          region: 'Vienna',
          country: 'Austria'
        },
        contact: {
          phone: '+43 1 234 5678',
          mobile: '+43 664 123 4567',
          email: 'office@destilat.at',
          website: 'https://destilat.at'
        },
        scoring: {
          overall: 87,
          genuineSupplier: 89,
          hospitalityFocus: 92,
          businessCredibility: 85,
          contactTransparency: 82
        },
        specializations: [
          'Restaurant Interior Design',
          'Hotel Room Concepts',
          'Contemporary Austrian Design'
        ],
        projects: [
          'Restaurant Figlmüller - Modern Renovation',
          'Hotel Das Triest - Suite Design',
          'Café Central Wien - Interior Refresh'
        ],
        searchTermsFound: [
          'restaurant einrichtung wien',
          'hotel interior design österreich',
          'gastronomie design'
        ],
        discovered: new Date().toISOString(),
        confidence: 0.87
      },
      {
        id: 'demo-3',
        name: 'Austrian Kitchen Solutions GmbH',
        description: 'Professional kitchen equipment for hotels and restaurants',
        location: {
          city: 'Innsbruck',
          region: 'Tirol',
          country: 'Austria'
        },
        contact: {
          phone: '+43 512 345 678',
          mobile: '+43 676 987 6543',
          email: 'info@aks-kitchen.at',
          website: 'https://aks-kitchen.at'
        },
        scoring: {
          overall: 84,
          genuineSupplier: 88,
          hospitalityFocus: 85,
          businessCredibility: 83,
          contactTransparency: 79
        },
        specializations: [
          'Hotel Kitchen Equipment',
          'Restaurant Kitchen Design',
          'Commercial Refrigeration'
        ],
        projects: [
          'Hotel Innsbruck - Kitchen Renovation',
          'Restaurant Stiftskeller - Equipment Supply',
          'Alpine Resort Kitchens - Full Outfitting'
        ],
        searchTermsFound: [
          'hotel küche ausrüstung tirol',
          'restaurant küchengeräte österreich',
          'gastronomie küchentechnik'
        ],
        discovered: new Date().toISOString(),
        confidence: 0.84
      }
    ];
    
    // Add some demo statistics
    const demoStats = {
      totalCompaniesFound: 127,
      highQualityLeads: 89,
      averageScore: 86.3,
      mobileExtractionRate: 0.85,
      regionsCovered: 9,
      searchTermsUsed: 45,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      companies: demoCompanies,
      statistics: demoStats,
      metadata: {
        demoMode: true,
        generatedAt: new Date().toISOString(),
        sampleSize: demoCompanies.length
      }
    });
    
  } catch (error) {
    console.error('Demo data fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch demo data'
    });
  }
});

/**
 * Demo authentication middleware
 */
function demoAuthMiddleware(req: Request, res: Response, next: any) {
  // Skip auth if not in demo mode
  if (process.env.DEMO_MODE !== 'true') {
    return next();
  }
  
  const session = req.session?.demo as DemoSession | undefined;
  
  if (!session || !session.authenticated) {
    return res.status(401).json({
      success: false,
      error: 'Demo authentication required'
    });
  }
  
  // Check expiration
  if (Date.now() > session.expiresAt) {
    delete req.session?.demo;
    return res.status(401).json({
      success: false,
      error: 'Demo session expired'
    });
  }
  
  // Add demo context to request
  req.demoUser = session;
  
  next();
}

// Extend Request interface for TypeScript
declare global {
  namespace Express {
    interface Request {
      demoUser?: DemoSession;
    }
  }
}

export default router;