# 🚀 Quick Deployment Checklist

## ✅ What's Been Done

All code changes are complete! Here's what was implemented:

1. ✅ Created `/api/llm.ts` - Vercel serverless function
2. ✅ Created `vercel.json` - Vercel configuration
3. ✅ Added comprehensive tests (15 tests, all passing)
4. ✅ Removed old `api.ts` file
5. ✅ Updated `package.json` with required dependencies
6. ✅ Created deployment documentation

## 📋 What You Need To Do Now

### Step 1: Commit and Push Your Changes

```bash
git add .
git commit -m "Add Vercel deployment configuration with OpenRouter API"
git push origin main
```

### Step 2: Get Your OpenRouter API Key

1. Go to https://openrouter.ai
2. Sign up or log in
3. Create an API key
4. Copy it (you'll need it in Step 4)

### Step 3: Deploy to Vercel

**Option A: Using Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/new
2. Import your Git repository
3. Vercel will auto-detect Vite configuration
4. Click "Deploy" (it will fail without the API key - that's expected!)

**Option B: Using Vercel CLI**

```bash
npm install -g vercel
vercel
```

### Step 4: Configure Environment Variables

**CRITICAL STEP - Your app won't work without this!**

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add these variables:

| Name | Value |
|------|-------|
| `OPENROUTER_API_KEY` | Your API key from Step 2 |
| `OPENROUTER_MODEL` | `xiaomi/mimo-v2-flash:free` |

4. Make sure to select "Production", "Preview", and "Development"
5. Click "Save"

### Step 5: Redeploy

After adding environment variables:

1. Go to "Deployments" tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"

OR just push another commit:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

### Step 6: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. You should see the setup form (no more black screen!)
3. Fill out the form and start a simulation
4. Verify AI responses appear

## 🎯 Expected Results

- ✅ Setup form loads correctly
- ✅ Starting a simulation generates AI responses
- ✅ Multiple turns work correctly
- ✅ No black screen
- ✅ No console errors

## 🐛 Troubleshooting

### Still seeing black screen?

1. Check browser console for errors (F12)
2. Verify environment variables are set in Vercel
3. Check Vercel function logs for errors

### "Missing OPENROUTER_API_KEY" error?

1. Go to Vercel Settings → Environment Variables
2. Verify `OPENROUTER_API_KEY` is set
3. Redeploy after adding it

### API requests failing?

1. Check your OpenRouter API key is valid
2. Verify the key has credits/quota
3. Check Vercel function logs for detailed errors

## 📚 Full Documentation

See `DEPLOYMENT.md` for complete deployment guide with troubleshooting.

## 🎉 You're Done!

Once deployed and tested, your app will be live and accessible to anyone with the URL!
