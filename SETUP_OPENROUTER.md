# Setting Up Open Router API

This guide explains how to configure Open Router for your AI Portfolio Agent.

## Why Open Router?

Open Router provides:
- **Free Models**: Access to free LLMs (Mistral, etc.) without needing a paid API key
- **Fallback Support**: Automatic fallback between different LLMs
- **Better Pricing**: Lower costs than OpenAI with multiple model options
- **No Quota Issues**: Better rate limiting and quota management
- **Easy Integration**: Compatible with OpenAI's API format

## Getting Started

### Option 1: Using a Free Model (No Cost)

Open Router offers free models that don't require billing. This is the easiest option:

1. Go to [Open Router](https://openrouter.ai/)
2. Click on "Sign up" (you can use GitHub or Google)
3. Once signed in, navigate to **API Keys** or **Settings**
4. Create or copy your API key (starts with `sk-or-v1-`)
5. Add it to your `.env` file:

```env
OPENROUTER_API_KEY=sk-or-v1-YOUR_API_KEY_HERE
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
```

### Option 2: Using Paid Models (Better Quality)

If you want better response quality, you can use paid models:

1. Set up your API key as above
2. Add billing information to your Open Router account
3. Update your `.env` file with a paid model:

```env
OPENROUTER_API_KEY=sk-or-v1-YOUR_API_KEY_HERE
OPENROUTER_MODEL=openai/gpt-3.5-turbo
```

## Available Models

### Free Models (No billing required)
- `mistralai/mistral-7b-instruct:free` - Fast, good quality
- Other free models vary - check Open Router's available list

### Paid Models
- `openai/gpt-3.5-turbo` - Fastest, best quality
- `mistralai/mistral-7b-instruct` - Fast, good quality
- `meta-llama/llama-2-70b-chat` - High quality
- Many others available

## Configuration

After getting your API key:

1. Open your `.env` file
2. Find the `OPENROUTER_API_KEY` variable
3. Replace `sk-or-v1-REPLACE_WITH_YOUR_KEY` with your actual key:

```env
# Open Router Configuration
OPENROUTER_API_KEY=sk-or-v1-XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
```

4. Save the file
5. Restart your server:

```bash
npm start
```

## Verification

Check the server logs for:

```
Calling Open Router API (mistralai/mistral-7b-instruct:free)...
```

This means Open Router is successfully configured and responding!

## Troubleshooting

### API Key Not Working
- Verify your key starts with `sk-or-v1-`
- Check that there are no extra spaces or characters
- Make sure your Open Router account is active

### Rate Limiting
- Free models may have stricter rate limits
- If you hit limits, upgrade to a paid model or wait before retrying
- Paid models have higher rate limits

### Slow Responses
- Some free models are slower
- Try switching to a faster paid model like GPT-3.5-Turbo
- Check Open Router's status page for service issues

### Model Not Available
- Open Router's available models change
- Check the [Open Router Models page](https://openrouter.ai/models) for current options
- Update `OPENROUTER_MODEL` in your `.env` file

## Testing

To test the API configuration:

1. Open your browser and go to `http://localhost:3000/chat.html`
2. Type a message and send it
3. Check the server logs for API responses
4. You should see successful responses from Open Router

## Support

If you need help:
1. Check [Open Router Documentation](https://openrouter.ai/docs)
2. Review the error messages in your server logs
3. The system will automatically fall back to mock responses if the API fails

## Switching Back to OpenAI

If you want to switch back to OpenAI:

1. Update your `.env` file with your OpenAI key:

```env
# Open Router Configuration
# OPENROUTER_API_KEY=sk-or-v1-xxx

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXX
```

2. Update `routes/chat.js` to use `OPENAI_API_KEY` instead of `OPENROUTER_API_KEY`
3. Restart the server

---

**Note**: Open Router is now the default. All API calls will use Open Router unless otherwise configured.
