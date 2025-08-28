# Validation Tests

This directory contains specialized validation tests for business requirements and customer feedback implementation.

## Files

### `andy-requirements-validation.ts`
Comprehensive validation test suite for Andy's 4 critical requirements:
1. **Hospitality keyword prioritization** - Search term optimization validation
2. **Mobile number extraction** - Austrian mobile detection testing  
3. **GPT-4 Vision analysis** - Hospitality project verification testing
4. **Anti-SEO filtering** - Genuine supplier scoring validation

### Usage

```bash
# Run validation tests
npm run test:validation

# Run specific Andy requirements validation
npx ts-node tests/validation/andy-requirements-validation.ts
```

### Test Companies
- **destilat Design Studio** - Interior design validation case
- **lichtwert concept GmbH** - Lighting specialist validation case

Both companies are real Austrian businesses used with customer Andy's permission for validation testing.