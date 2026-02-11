# Render Backend Deployment Guide

## Prerequisites

1. **Render Account**: Sign up at [https://render.com](https://render.com) (free tier available)
2. **GitHub Repository**: Your code should be in a GitHub repository

## Step 1: Connect GitHub to Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub account if you haven't already
4. Select your repository: `your-username/your-repo-name`
5. Select the branch: `main` (or your default branch)

## Step 2: Configure the Web Service

Fill in the following settings:

### Basic Settings
- **Name**: `carassauga-backend`
- **Region**: Choose closest to you (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `server` (important!)

### Build & Deploy
- **Environment**: `Node`
- **Build Command**: `npm ci`
- **Start Command**: `npx ts-node --transpile-only src/server.ts`

### Environment Variables
Click "Advanced" → "Add Environment Variable" and add:

```
NODE_ENV=production
PORT=10000
CLIENT_URL=https://carassauga-app.web.app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-please-make-it-long-and-random
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-also-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

**Important**: Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Run this twice to get two different secrets for JWT_SECRET and JWT_REFRESH_SECRET.

### Health Check
- **Health Check Path**: `/health`

## Step 3: Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies (`npm ci`)
   - Start your server
3. Wait for deployment to complete (usually 2-5 minutes)

## Step 4: Get Your API URL

After deployment succeeds:
1. Your service will have a URL like: `https://carassauga-backend.onrender.com`
2. Copy this URL
3. Test it: `https://carassauga-backend.onrender.com/health`

## Step 5: Update Frontend

Once you have your Render URL:

1. Update `/Users/oscarbello/Desktop/files/client/.env.production`:
   ```
   VITE_API_URL=https://your-render-url.onrender.com/api
   ```

2. Rebuild and redeploy frontend:
   ```bash
   cd /Users/oscarbello/Desktop/files
   npm run build:client
   firebase deploy --only hosting --project carassauga-app
   ```

## Troubleshooting

### Service keeps sleeping (Free Tier)
- Render free tier services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Consider upgrading to paid plan for always-on service

### Check Logs
- Go to your service dashboard on Render
- Click "Logs" tab to see real-time logs
- Check for any errors during startup

### Database Issues
- SQLite database is stored in `/app/data/carassauga.db`
- On Render, this is ephemeral (resets on redeploy)
- For production, consider using Render PostgreSQL addon

## Alternative: Using render.yaml (Auto-deploy)

If you prefer automatic configuration:

1. The `render.yaml` file is already created in the root directory
2. In Render dashboard:
   - Click "New +" → "Blueprint"
   - Connect your GitHub repo
   - Render will automatically detect `render.yaml` and configure everything

## Next Steps

After deployment:
- ✅ Test the health endpoint
- ✅ Update frontend API URL
- ✅ Test login functionality
- ✅ Monitor logs for any issues
