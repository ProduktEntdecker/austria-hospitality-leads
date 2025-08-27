# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-11-20

### Added
- Initial project setup with complete B2B hospitality outfitting focus
- Austrian VAT ID (UID/ATU) extraction from Impressum pages
- Comprehensive German search terms for hospitality outfitters
- Multi-AI enrichment pipeline (Claude, OpenAI, Perplexity)
- n8n automation workflows for web scraping and data processing
- PostgreSQL data models with B2B service provider fields
- Next.js frontend dashboard for company management
- GDPR-aligned data handling practices for Austrian market
- Docker containerization with development and production modes
- Comprehensive API documentation and testing framework

### Business Types Supported
- Interior Design firms (Innenarchitektur für Hotels/Restaurants)
- Hotel Outfitters (Hotelausstatter)
- Restaurant Outfitters (Gastronomieeinrichtung)
- Lighting Specialists (Lichtplanung)
- Furniture Suppliers (Möbellieferant)
- Kitchen Equipment providers (Küchenausstattung)
- Textile Suppliers (Textilien/Bettwäsche)
- Flooring Specialists (Bodenbeläge)
- Bathroom Outfitters (Badeinrichtung)
- AV Technology providers (Audio/Video Technik)
- Signage Design (Beschilderung/Corporate Design)
- Wellness Equipment (Wellness/Spa Ausstattung)

### Target Market
- Austrian B2B service providers to hospitality industry
- Focus on companies that outfit and furnish hotels and restaurants
- Service providers, not end customers (hotels/restaurants)
- Geographic coverage: All Austrian regions (Bundesländer)

### Technical Features
- German language search optimization
- Austrian postal code and region validation
- Business contact extraction and validation
- Service specialization classification
- Portfolio strength assessment
- Partnership potential scoring
- Real-time web scraping with rate limiting
- Automated data enrichment workflows
- Manual review and validation interface

### Infrastructure
- Node.js backend with TypeScript
- PostgreSQL database with Prisma ORM
- Redis for caching and job queues
- n8n for workflow automation
- Next.js React frontend
- Docker deployment configuration
- Comprehensive monitoring and logging

[Unreleased]: https://github.com/ProduktEntdecker/austria-hospitality-leads/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ProduktEntdecker/austria-hospitality-leads/releases/tag/v1.0.0