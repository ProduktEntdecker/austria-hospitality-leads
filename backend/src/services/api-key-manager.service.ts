import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

// API Key validation schemas
const APIKeySchema = z.object({
  anthropic: z.string().optional(),
  openai: z.string().optional(),
  perplexity: z.string().optional(),
  deepseek: z.string().optional(),
  google_maps: z.string().optional(),
  google_places: z.string().optional(),
  n8n: z.string().optional(),
});

const EncryptedKeysSchema = z.object({
  keys: z.string(),
  iv: z.string(),
  tag: z.string(),
  version: z.number(),
  lastUpdated: z.string(),
});

export type APIKeys = z.infer<typeof APIKeySchema>;
export type EncryptedKeys = z.infer<typeof EncryptedKeysSchema>;

export class APIKeyManagerService {
  private static instance: APIKeyManagerService;
  private readonly KEYS_FILE_PATH = path.join(process.cwd(), '.keys.encrypted');
  private readonly ENCRYPTION_KEY: Buffer;
  private readonly ALGORITHM = 'aes-256-gcm';
  private memoryCache: APIKeys | null = null;

  constructor() {
    // Use environment encryption key or generate one for development
    const key = process.env.ENCRYPTION_KEY || 'dev-encryption-key-32-chars-long';
    this.ENCRYPTION_KEY = Buffer.from(key.padEnd(32, '0').slice(0, 32));
  }

  static getInstance(): APIKeyManagerService {
    if (!APIKeyManagerService.instance) {
      APIKeyManagerService.instance = new APIKeyManagerService();
    }
    return APIKeyManagerService.instance;
  }

  /**
   * Encrypt API keys for secure storage
   */
  private encrypt(data: APIKeys): EncryptedKeys {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.ENCRYPTION_KEY, iv);
    
    const jsonStr = JSON.stringify(data);
    let encrypted = cipher.update(jsonStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      keys: encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      version: 1,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Decrypt API keys from storage
   */
  private decrypt(encryptedData: EncryptedKeys): APIKeys {
    const decipher = crypto.createDecipheriv(
      this.ALGORITHM,
      this.ENCRYPTION_KEY,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.keys, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted) as APIKeys;
  }

  /**
   * Save API keys securely
   */
  async saveKeys(keys: APIKeys): Promise<void> {
    try {
      // Validate keys
      const validated = APIKeySchema.parse(keys);
      
      // Encrypt the keys
      const encrypted = this.encrypt(validated);
      
      // Save to file
      await fs.writeFile(
        this.KEYS_FILE_PATH,
        JSON.stringify(encrypted, null, 2),
        'utf8'
      );
      
      // Update memory cache
      this.memoryCache = validated;
      
      // Also update .env file for local development
      if (process.env.NODE_ENV === 'development') {
        await this.updateEnvFile(validated);
      }
    } catch (error) {
      console.error('Failed to save API keys:', error);
      throw new Error('Failed to save API keys securely');
    }
  }

  /**
   * Load API keys from secure storage
   */
  async loadKeys(): Promise<APIKeys> {
    // Return from memory cache if available
    if (this.memoryCache) {
      return this.memoryCache;
    }

    try {
      // Try to load from encrypted file
      const encryptedContent = await fs.readFile(this.KEYS_FILE_PATH, 'utf8');
      const encryptedData = EncryptedKeysSchema.parse(JSON.parse(encryptedContent));
      const decrypted = this.decrypt(encryptedData);
      
      // Update memory cache
      this.memoryCache = decrypted;
      
      return decrypted;
    } catch (error) {
      // If file doesn't exist or is corrupted, return from environment
      console.warn('No encrypted keys file found, using environment variables');
      return this.getKeysFromEnvironment();
    }
  }

  /**
   * Get keys from environment variables (fallback)
   */
  private getKeysFromEnvironment(): APIKeys {
    return {
      anthropic: process.env.ANTHROPIC_API_KEY || '',
      openai: process.env.OPENAI_API_KEY || '',
      perplexity: process.env.PERPLEXITY_API_KEY || '',
      deepseek: process.env.DEEPSEEK_API_KEY || '',
      google_maps: process.env.GOOGLE_MAPS_API_KEY || '',
      google_places: process.env.GOOGLE_PLACES_API_KEY || '',
      n8n: process.env.N8N_API_KEY || '',
    };
  }

  /**
   * Update .env file for local development
   */
  private async updateEnvFile(keys: APIKeys): Promise<void> {
    const envPath = path.join(process.cwd(), '.env');
    
    try {
      let envContent = await fs.readFile(envPath, 'utf8');
      
      // Update each key in the .env file
      const updates = [
        { key: 'ANTHROPIC_API_KEY', value: keys.anthropic },
        { key: 'OPENAI_API_KEY', value: keys.openai },
        { key: 'PERPLEXITY_API_KEY', value: keys.perplexity },
        { key: 'DEEPSEEK_API_KEY', value: keys.deepseek },
        { key: 'GOOGLE_MAPS_API_KEY', value: keys.google_maps },
        { key: 'GOOGLE_PLACES_API_KEY', value: keys.google_places },
        { key: 'N8N_API_KEY', value: keys.n8n },
      ];
      
      for (const { key, value } of updates) {
        if (value) {
          const regex = new RegExp(`^${key}=.*$`, 'm');
          if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `${key}=${value}`);
          } else {
            envContent += `\n${key}=${value}`;
          }
        }
      }
      
      await fs.writeFile(envPath, envContent, 'utf8');
    } catch (error) {
      console.error('Failed to update .env file:', error);
    }
  }

  /**
   * Delete a specific API key
   */
  async deleteKey(keyName: keyof APIKeys): Promise<void> {
    const keys = await this.loadKeys();
    delete keys[keyName];
    await this.saveKeys(keys);
  }

  /**
   * Clear all API keys
   */
  async clearAllKeys(): Promise<void> {
    try {
      await fs.unlink(this.KEYS_FILE_PATH);
      this.memoryCache = null;
    } catch (error) {
      // File might not exist
      console.warn('No keys file to delete');
    }
  }

  /**
   * Test API key validity
   */
  async testKey(provider: keyof APIKeys, key: string): Promise<boolean> {
    try {
      switch (provider) {
        case 'anthropic':
          return await this.testAnthropicKey(key);
        case 'openai':
          return await this.testOpenAIKey(key);
        case 'perplexity':
          return await this.testPerplexityKey(key);
        case 'deepseek':
          return await this.testDeepseekKey(key);
        case 'google_maps':
        case 'google_places':
          return await this.testGoogleKey(key);
        default:
          return true; // For other keys, assume valid if provided
      }
    } catch (error) {
      console.error(`Failed to test ${provider} key:`, error);
      return false;
    }
  }

  private async testAnthropicKey(key: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });
      
      return response.status !== 401;
    } catch {
      return false;
    }
  }

  private async testOpenAIKey(key: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`,
        },
      });
      
      return response.status !== 401;
    } catch {
      return false;
    }
  }

  private async testPerplexityKey(key: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10,
        }),
      });
      
      return response.status !== 401;
    } catch {
      return false;
    }
  }

  private async testDeepseekKey(key: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10,
        }),
      });
      
      return response.status !== 401;
    } catch {
      return false;
    }
  }

  private async testGoogleKey(key: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=Vienna&key=${key}`
      );
      
      const data = await response.json() as { status: string };
      return data.status !== 'REQUEST_DENIED';
    } catch {
      return false;
    }
  }

  /**
   * Get masked version of keys for display
   */
  async getMaskedKeys(): Promise<Record<keyof APIKeys, string>> {
    const keys = await this.loadKeys();
    const masked: Record<string, string> = {};
    
    for (const [provider, key] of Object.entries(keys)) {
      if (key && typeof key === 'string') {
        // Show first 4 and last 4 characters
        if (key.length > 12) {
          masked[provider] = `${key.slice(0, 4)}...${key.slice(-4)}`;
        } else if (key.length > 0) {
          masked[provider] = '***hidden***';
        } else {
          masked[provider] = '';
        }
      } else {
        masked[provider] = '';
      }
    }
    
    return masked as Record<keyof APIKeys, string>;
  }
}