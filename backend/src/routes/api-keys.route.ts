import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { APIKeyManagerService } from '../services/api-key-manager.service';

const router = Router();
const keyManager = APIKeyManagerService.getInstance();

// Validation schemas
const SaveKeysSchema = z.object({
  anthropic: z.string().optional(),
  openai: z.string().optional(),
  perplexity: z.string().optional(),
  deepseek: z.string().optional(),
  google_maps: z.string().optional(),
  google_places: z.string().optional(),
  n8n: z.string().optional(),
});

const TestKeySchema = z.object({
  provider: z.enum(['anthropic', 'openai', 'perplexity', 'deepseek', 'google_maps', 'google_places', 'n8n']),
  key: z.string().min(1),
});

/**
 * GET /api/keys
 * Get masked API keys
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const maskedKeys = await keyManager.getMaskedKeys();
    res.json({
      success: true,
      keys: maskedKeys,
    });
  } catch (error) {
    console.error('Failed to get API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve API keys',
    });
  }
});

/**
 * POST /api/keys
 * Save or update API keys
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const keys = SaveKeysSchema.parse(req.body);
    
    // Only save non-empty keys
    const filteredKeys = Object.fromEntries(
      Object.entries(keys).filter(([_, value]) => value && value.length > 0)
    );
    
    await keyManager.saveKeys(filteredKeys);
    
    res.json({
      success: true,
      message: 'API keys saved successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid key format',
        details: error.errors,
      });
    } else {
      console.error('Failed to save API keys:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save API keys',
      });
    }
  }
});

/**
 * POST /api/keys/test
 * Test an API key
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { provider, key } = TestKeySchema.parse(req.body);
    
    const isValid = await keyManager.testKey(provider, key);
    
    res.json({
      success: true,
      provider,
      valid: isValid,
      message: isValid ? 'API key is valid' : 'API key is invalid or expired',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid request format',
        details: error.errors,
      });
    } else {
      console.error('Failed to test API key:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test API key',
      });
    }
  }
});

/**
 * DELETE /api/keys/:provider
 * Delete a specific API key
 */
router.delete('/:provider', async (req: Request, res: Response) => {
  try {
    const provider = req.params.provider as keyof typeof SaveKeysSchema.shape;
    
    if (!SaveKeysSchema.shape[provider]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider name',
      });
    }
    
    await keyManager.deleteKey(provider);
    
    res.json({
      success: true,
      message: `${provider} key deleted successfully`,
    });
  } catch (error) {
    console.error('Failed to delete API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete API key',
    });
  }
});

/**
 * DELETE /api/keys
 * Clear all API keys
 */
router.delete('/', async (req: Request, res: Response) => {
  try {
    await keyManager.clearAllKeys();
    
    res.json({
      success: true,
      message: 'All API keys cleared successfully',
    });
  } catch (error) {
    console.error('Failed to clear API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear API keys',
    });
  }
});

/**
 * GET /api/keys/status
 * Get the status of all configured keys
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const keys = await keyManager.loadKeys();
    const status: Record<string, boolean> = {};
    
    for (const [provider, key] of Object.entries(keys)) {
      if (key && typeof key === 'string' && key.length > 0) {
        status[provider] = true;
      } else {
        status[provider] = false;
      }
    }
    
    res.json({
      success: true,
      status,
      configured: Object.values(status).filter(Boolean).length,
      total: Object.keys(status).length,
    });
  } catch (error) {
    console.error('Failed to get key status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get key status',
    });
  }
});

export default router;