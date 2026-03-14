# 🔑 DeepSeek API Key Setup Instructions

## Overview
This application now uses the DeepSeek API for AI-powered career guidance and recommendations. DeepSeek provides high-quality AI models at competitive rates.

## How to Get Your API Key

### Step 1: Create a DeepSeek Account
1. Go to [https://platform.deepseek.com](https://platform.deepseek.com)
2. Sign up for a new account or log in
3. Navigate to the API Keys section
4. Generate a new API key
5. Copy the new key (it should start with `sk-`)

### Step 2: Update Your Environment File
Create or update your `.env.local` file with your DeepSeek API key:

```bash
# DeepSeek API Configuration
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Supabase Configuration (if not already set)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Step 3: Restart the Development Server
After updating the API key:
1. Stop the current dev server (Ctrl+C)
2. Run `npm run dev` again
3. Test the AI chat and career recommendations

## DeepSeek API Features
- **Model**: `deepseek-chat` (non-thinking mode of DeepSeek-V3.1)
- **Base URL**: `https://api.deepseek.com`
- **Compatible**: OpenAI-compatible API format
- **Pricing**: Competitive rates for high-quality AI responses

## Testing
Once you have a valid API key, all AI features should work properly:
- Career guidance chat
- Course recommendations
- Career detail generation
- Academic performance analysis

## Security Note
Never commit API keys to version control. The `.env.local` file is already in `.gitignore` to prevent this.
