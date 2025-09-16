# 🔑 API Key Setup Instructions

## Current Issue
The OpenRouter API key in your `.env.local` file is returning a 401 "User not found" error, which means it's invalid or expired.

## How to Fix

### Step 1: Get a New API Key
1. Go to [https://openrouter.ai](https://openrouter.ai)
2. Sign up or log in to your account
3. Navigate to your API keys section
4. Generate a new API key
5. Copy the new key (it should start with `sk-or-v1-`)

### Step 2: Update Your Environment File
Replace the current API key in `.env.local`:

```bash
# Current (invalid):
VITE_OPENROUTER_API_KEY=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

# Replace with your new key:
VITE_OPENROUTER_API_KEY=your_new_api_key_here
```

### Step 3: Restart the Development Server
After updating the API key:
1. Stop the current dev server (Ctrl+C)
2. Run `npm run dev` again
3. Test the career details modal

## Alternative: Use a Different AI Service
If you prefer, we can also integrate with other AI services like:
- OpenAI API
- Anthropic Claude API
- Google Gemini API

## Testing
Once you have a valid API key, the career details modal should work properly and show AI-generated insights about each career path.

## Security Note
Never commit API keys to version control. The `.env.local` file is already in `.gitignore` to prevent this.
