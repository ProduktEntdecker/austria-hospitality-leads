# API Key Setup Guide

## 🔐 Security First Approach

This application uses a **multi-layered security approach** for API key management:

1. **Never commit API keys** to the repository
2. **Encrypted storage** using AES-256-GCM
3. **User-provided keys** for production
4. **Secure web interface** for key management

## 📋 How to Add Your API Keys

### Option 1: Web Interface (Recommended) 🌐

1. Start the application:
   ```bash
   npm run dev
   ```

2. Navigate to Settings:
   - Open http://localhost:3000/settings
   - Click on the "API Keys" tab

3. Add your keys:
   - Enter each API key in the secure input fields
   - Click "Test" to validate each key
   - Click "Save Keys Securely" to encrypt and store

### Option 2: Environment File (Development) 📄

1. Edit the `.env` file (already created):
   ```bash
   # Open in your preferred editor
   nano .env
   # or
   code .env
   ```

2. Add your API keys:
   ```env
   # Add your actual keys here (never commit this file!)
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
   OPENAI_API_KEY=sk-your-actual-openai-key-here
   PERPLEXITY_API_KEY=pplx-your-actual-key-here
   DEEPSEEK_API_KEY=your-deepseek-key-here
   ```

3. Save the file (it's already in .gitignore)

### Option 3: Encrypted Command Line 🔒

You can also provide keys via command line (they'll be encrypted):

```bash
# Set a single key
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env

# Or use the API endpoint
curl -X POST http://localhost:3001/api/keys \
  -H "Content-Type: application/json" \
  -d '{
    "anthropic": "sk-ant-your-key",
    "openai": "sk-your-key"
  }'
```

## 🔑 Required API Keys

### Essential (Required for core functionality):

1. **Anthropic (Claude)** - Primary AI provider
   - Get key: https://console.anthropic.com/keys
   - Used for: Lead enrichment, content analysis

2. **OpenAI** - Fallback AI provider  
   - Get key: https://platform.openai.com/api-keys
   - Used for: Image analysis, mobile extraction

### Optional (Enhanced features):

3. **Perplexity AI** - Real-time search
   - Get key: https://www.perplexity.ai/settings/api
   - Used for: Current company information

4. **DeepSeek** - Bulk processing
   - Get key: https://platform.deepseek.com/api_keys
   - Used for: Cost-effective batch operations

5. **Google Maps** - Location data
   - Get key: https://console.cloud.google.com/apis/credentials
   - Used for: Business location enrichment

## 🛡️ Security Features

### Encryption
- Keys are encrypted using **AES-256-GCM**
- Stored in `.keys.encrypted` (never committed)
- Unique IV and auth tag for each encryption

### Access Control
- Keys are only accessible server-side
- Never exposed to frontend code
- Masked display in UI (shows only first/last 4 chars)

### Key Rotation
- Easy key updates through web interface
- Test keys before saving
- Delete individual keys or clear all

## 🚀 Production Deployment

### For Your Testing:
1. Use the Settings page to add your keys
2. Keys are stored encrypted locally
3. Test each key using the validation feature

### For Customer Deployment:
1. Each customer provides their own keys
2. Keys are entered through the secure Settings interface
3. No keys are shared between customers
4. Keys are encrypted per deployment

## ⚠️ Important Notes

1. **Never share your API keys** with anyone
2. **The .env file is gitignored** - it won't be committed
3. **Keys are encrypted** before storage
4. **Use the web interface** for the most secure experience
5. **Test keys regularly** to ensure they're valid

## 🆘 Troubleshooting

### Key not working?
1. Check for extra spaces or line breaks
2. Ensure the key hasn't expired
3. Verify you have the right permissions
4. Use the "Test" button to validate

### Can't save keys?
1. Ensure the backend is running (`npm run dev:backend`)
2. Check write permissions for the project directory
3. Verify encryption key is set in environment

### Keys disappeared?
1. Check if `.keys.encrypted` exists
2. Keys might be in `.env` file as backup
3. Use Settings page to re-enter keys

## 📝 Best Practices

1. **Rotate keys regularly** (every 90 days)
2. **Use different keys** for dev/staging/production
3. **Monitor API usage** to detect anomalies
4. **Set rate limits** appropriate to your plan
5. **Keep keys in password manager** for backup

## 🔄 Key Management Commands

```bash
# Check key status
curl http://localhost:3001/api/keys/status

# Test a specific key
curl -X POST http://localhost:3001/api/keys/test \
  -H "Content-Type: application/json" \
  -d '{"provider": "anthropic", "key": "sk-ant-..."}'

# Delete all keys (careful!)
curl -X DELETE http://localhost:3001/api/keys
```

## 📧 Support

If you need help with API keys:
1. Check the provider's documentation
2. Ensure you have an active subscription
3. Contact the API provider's support
4. For app-specific issues, check our documentation

---

Remember: **Security is everyone's responsibility**. Keep your keys safe! 🔐