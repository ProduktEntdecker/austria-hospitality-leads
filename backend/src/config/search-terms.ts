/**
 * Austrian Hospitality Outfitting Search Terms
 * Comprehensive search terms for finding B2B service providers to hotels and restaurants
 */

export const AUSTRIAN_SEARCH_TERMS = {
  // Primary search terms (most important)
  PRIMARY: [
    'hoteleinrichtung',
    'hotelausstatter', 
    'gastronomieeinrichtung',
    'innenarchitekten hotel',
    'lichtplanung gastronomie',
    'möbel hotel restaurant'
  ],

  // Interior Design & Architecture
  INTERIOR_DESIGN: [
    'innenarchitektur hotel',
    'innenarchitektur gastronomie',
    'hoteldesign',
    'restaurantdesign',
    'inneneinrichtung hotel',
    'hotelarchitekt',
    'gastronomie innenarchitekt',
    'hospitality design',
    'hotel interior design'
  ],

  // Hotel Outfitting
  HOTEL_OUTFITTERS: [
    'hotelausstatter österreich',
    'hotelmöbel',
    'hoteleinrichtung wien',
    'hotelzimmer einrichtung',
    'hotel komplettausstattung',
    'hoteleinrichter',
    'gastronomiemöbel',
    'hotelausstattung'
  ],

  // Restaurant Equipment & Design  
  RESTAURANT_OUTFITTERS: [
    'gastronomieeinrichtung österreich',
    'restauranteinrichtung',
    'gastronomieausstattung',
    'restaurant möbel',
    'gastronomie inneneinrichtung',
    'restaurantausstatter',
    'gastronomieplaner',
    'küchen gastronomie'
  ],

  // Lighting Specialists
  LIGHTING: [
    'lichtplanung hotel',
    'lichtplanung restaurant',
    'lichtdesign gastronomie',
    'hotellicht',
    'beleuchtung gastronomie',
    'lichtkonzept hotel',
    'led beleuchtung hotel',
    'restaurant beleuchtung'
  ],

  // Furniture Suppliers
  FURNITURE: [
    'hotelmöbel österreich',
    'restaurantmöbel',
    'gastronomiemöbel wien',
    'contract furniture',
    'objektmöbel hotel',
    'möbel gastronomie',
    'hotelzimmermöbel',
    'hotel lobby möbel'
  ],

  // Kitchen Equipment
  KITCHEN_EQUIPMENT: [
    'großküchen österreich',
    'hotelküchen ausstattung',
    'gastronomiegeräte',
    'küchentechnik hotel',
    'kücheneinrichtung gastronomie',
    'gewerbliche küchen',
    'hotel küchen planung'
  ],

  // Textile & Soft Furnishing
  TEXTILES: [
    'hoteltextilien',
    'bettwäsche hotel',
    'restaurant textilien',
    'vorhänge hotel',
    'teppiche hotel',
    'polsterstoffe gastronomie',
    'hotelteppiche'
  ],

  // Flooring Specialists
  FLOORING: [
    'bodenbeläge hotel',
    'hotel fußboden',
    'gastronomie boden',
    'restaurant bodenbelag',
    'objektboden hotel',
    'bodengestaltung gastronomie'
  ],

  // Bathroom Outfitters
  BATHROOM: [
    'hotelbäder',
    'sanitär hotel',
    'badeinrichtung hotel',
    'wellness ausstattung',
    'spa einrichtung',
    'hotel sanitäranlagen'
  ],

  // AV Technology
  AV_TECHNOLOGY: [
    'hoteltechnik',
    'av technik hotel',
    'konferenztechnik hotel',
    'restaurant technik',
    'entertainment system hotel',
    'sound system gastronomie'
  ],

  // Signage & Branding
  SIGNAGE: [
    'hotel beschilderung',
    'leitsystem hotel',
    'corporate design hotel',
    'hotel branding',
    'wegweiser hotel',
    'schilder gastronomie'
  ],

  // Wellness & Spa
  WELLNESS: [
    'spa ausstattung',
    'wellness einrichtung',
    'hotel spa design',
    'sauna hotel',
    'fitness hotel ausstattung',
    'wellnessbereich hotel'
  ]
};

// Search term combinations for different platforms
export const SEARCH_COMBINATIONS = {
  // Google search combinations
  GOOGLE_SEARCHES: [
    'hoteleinrichtung österreich',
    'hotelausstatter wien salzburg innsbruck',
    'gastronomieeinrichtung austria', 
    'innenarchitekt hotel restaurant österreich',
    'lichtplanung gastronomie austria',
    'möbel hotel restaurant österreich',
    'hoteldesign innenarchitektur austria',
    'gastronomiemöbel österreich',
    'hoteltextilien österreich lieferant'
  ],

  // Yellow Pages / Business Directory searches  
  DIRECTORY_SEARCHES: [
    'innenarchitektur',
    'möbelhandel',
    'lichtplanung',
    'kücheneinrichtung',
    'textilien',
    'bodenbeläge',
    'sanitärtechnik',
    'elektrotechnik'
  ],

  // Industry-specific searches
  INDUSTRY_TERMS: [
    'hospitality design austria',
    'contract furniture austria', 
    'hotel ff&e austria', // Furniture, Fixtures & Equipment
    'hotel procurement austria',
    'gastronomy equipment austria',
    'hotel suppliers austria'
  ]
};

// Regional modifiers for Austrian market
export const AUSTRIAN_REGIONS = [
  'wien', 'vienna',
  'salzburg', 
  'innsbruck', 'tirol',
  'graz', 'steiermark',
  'linz', 'oberösterreich',
  'klagenfurt', 'kärnten',
  'bregenz', 'vorarlberg',
  'eisenstadt', 'burgenland',
  'st. pölten', 'niederösterreich',
  'österreich', 'austria'
];

// Company identifiers (to filter results)
export const COMPANY_IDENTIFIERS = {
  BUSINESS_TYPES: [
    'gmbh', 'kg', 'og', 'ag', 
    'einzelunternehmen', 'e.u.',
    'ges.m.b.h', 'gesellschaft',
    'unternehmen', 'firma',
    'betrieb', 'studio', 'büro'
  ],

  // Terms that indicate B2B service providers
  SERVICE_INDICATORS: [
    'planung', 'beratung', 'konzept',
    'realisierung', 'umsetzung',
    'lieferung', 'montage', 'installation',
    'projektierung', 'ausführung',
    'komplettlösung', 'fullservice'
  ]
};

// Exclusion terms (to avoid end customers)
export const EXCLUSION_TERMS = [
  'hotel buchung', 'hotel reservation',
  'zimmer buchen', 'übernachtung',
  'restaurant tisch', 'reservierung',
  'menupreise', 'speisekarte',
  'wellness urlaub', 'spa behandlung',
  'hochzeit location', 'event location'
];

// Quality indicators for company validation
export const QUALITY_INDICATORS = {
  HIGH_QUALITY: [
    'zertifiziert', 'iso',
    'mitglied', 'verband',
    'auszeichnung', 'award',
    'referenzen', 'projekte',
    'jahre erfahrung', 'tradition'
  ],

  PORTFOLIO_KEYWORDS: [
    'projekte', 'referenzen', 'portfolio',
    'realisiert', 'umgesetzt', 'projektiert',
    'hotels', 'restaurants', 'gastronomie',
    'hospitality', 'hotellerie'
  ]
};