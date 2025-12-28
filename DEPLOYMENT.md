# Deployment Guide: Vibe Life Simulator on Vercel

This guide will walk you through deploying your Vibe Life Simulator application to Vercel with OpenRouter API integration.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- An OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai))
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Get Your OpenRouter API Key

1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the key - you'll need it in Step 3

## Step 2: Connect Your Repository to Vercel

### Option A: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Vercel to access your repositories
5. Select your `simulive` repository
6. Click "Import"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to your project directory
cd /path/to/simulive

# Deploy
vercel
```

Follow the prompts to link your project to Vercel.

## Step 3: Configure Environment Variables

**CRITICAL:** You must configure the OpenRouter API key before your app will work.

### Via Vercel Dashboard

1. Go to your project dashboard on Vercel
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Production, Preview, Development |
| `OPENROUTER_MODEL` | `xiaomi/mimo-v2-flash:free` | Production, Preview, Development |

5. Click "Save"

### Via Vercel CLI

```bash
# Set production environment variable
vercel env add OPENROUTER_API_KEY production

# When prompted, paste your OpenRouter API key

# Set the model (optional, defaults to xiaomi/mimo-v2-flash:free)
vercel env add OPENROUTER_MODEL production
# When prompted, enter: xiaomi/mimo-v2-flash:free
```

## Step 4: Deploy

### Automatic Deployment

Once connected, Vercel automatically deploys your app whenever you push to your main branch.

```bash
git add .
git commit -m "Configure Vercel deployment"
git push origin main
```

### Manual Deployment

Using Vercel CLI:

```bash
vercel --prod
```

## Step 5: Verify Deployment

1. Wait for the deployment to complete (usually 1-2 minutes)
2. Vercel will provide a URL (e.g., `https://your-app.vercel.app`)
3. Visit the URL
4. You should see the setup form (no black screen!)
5. Try starting a simulation to verify the AI integration works

## Troubleshooting

### Black Screen on Deployment

**Cause:** The API endpoint is not configured correctly or environment variables are missing.

**Solution:**
1. Check that `/api/llm.ts` exists in your repository
2. Verify environment variables are set in Vercel dashboard
3. Check the Vercel function logs for errors

### "Missing OPENROUTER_API_KEY" Error

**Cause:** The environment variable is not configured in Vercel.

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `OPENROUTER_API_KEY` with your API key
3. Redeploy the application

### API Requests Failing

**Cause:** OpenRouter API key is invalid or rate limited.

**Solution:**
1. Verify your API key is correct at [openrouter.ai](https://openrouter.ai)
2. Check your OpenRouter account for rate limits
3. The free tier of `xiaomi/mimo-v2-flash:free` may have usage limits

### Build Failures

**Cause:** Missing dependencies or TypeScript errors.

**Solution:**
1. Run `npm install` locally to ensure all dependencies are installed
2. Run `npm run build` locally to check for build errors
3. Fix any TypeScript errors before deploying
4. Check Vercel build logs for specific error messages

## Viewing Logs

### Function Logs

1. Go to Vercel Dashboard → Your Project
2. Click on "Deployments" tab
3. Click on the latest deployment
4. Click on "Functions" tab
5. Click on `/api/llm` to see function logs

### Build Logs

1. Go to Vercel Dashboard → Your Project
2. Click on "Deployments" tab
3. Click on the latest deployment
4. View the "Building" section for build logs

## Testing Locally with Vercel CLI

You can test the serverless function locally before deploying:

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Set local environment variables
vercel env pull .env.local

# Or manually create .env.local with:
# OPENROUTER_API_KEY=your_key_here
# OPENROUTER_MODEL=xiaomi/mimo-v2-flash:free

# Run local development server
vercel dev
```

Visit `http://localhost:3000` to test locally.

## Project Structure

```
simulive/
├── api/
│   └── llm.ts              # Vercel serverless function
├── components/             # React components
├── services/
│   └── geminiService.ts    # Frontend API client
├── dist/                   # Build output (generated)
├── vercel.json             # Vercel configuration
├── package.json
└── vite.config.ts
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | Yes | None | Your OpenRouter API key |
| `OPENROUTER_MODEL` | No | `xiaomi/mimo-v2-flash:free` | The AI model to use |

## Supported Models

The application is configured to use `xiaomi/mimo-v2-flash:free` by default, which is free to use. You can change this by setting the `OPENROUTER_MODEL` environment variable to any model supported by OpenRouter.

Popular alternatives:
- `anthropic/claude-3-haiku` (paid)
- `openai/gpt-3.5-turbo` (paid)
- `meta-llama/llama-3-8b-instruct` (free)

Check [openrouter.ai/models](https://openrouter.ai/models) for the full list.

## Custom Domain

To use a custom domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS

## Continuous Deployment

Vercel automatically deploys:
- **Production:** Pushes to your main/master branch
- **Preview:** Pull requests and other branches

You can configure this in Settings → Git.

## Support

If you encounter issues:

1. Check the [Vercel Documentation](https://vercel.com/docs)
2. Check the [OpenRouter Documentation](https://openrouter.ai/docs)
3. Review the Vercel function logs for error messages
4. Ensure all environment variables are correctly set

## Security Notes

- Never commit your `OPENROUTER_API_KEY` to Git
- Always use environment variables for sensitive data
- The API key is only accessible server-side (in `/api/llm.ts`)
- The frontend never sees the API key

## Next Steps

After successful deployment:

1. Test all features of your application
2. Monitor usage on OpenRouter dashboard
3. Set up custom domain (optional)
4. Configure preview deployments for testing
5. Share your deployed app URL!

Enjoy your deployed Vibe Life Simulator! 🎉
