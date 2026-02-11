# Railway Backend Deployment Guide

## Step 1: Login to Railway

Run this command in your terminal:

```bash
cd /Users/oscarbello/Desktop/files/server
railway login
```

This will open a browser for authentication.

## Step 2: Create a New Railway Project

After logging in, run:

```bash
railway init
```

When prompted:
- **Project name**: `carassauga-backend` (or any name you prefer)
- **Environment**: Choose `Production`

## Step 3: Deploy to Railway

```bash
railway up
```

This will:
1. Build and deploy your server
2. Generate a public URL for your API

## Step 4: Get Your API URL

After deployment, Railway will provide a URL like:
- `https://carassauga-backend-production.up.railway.app`

Get the URL by running:
```bash
railway domain
```

Or check the Railway dashboard at: https://railway.app

## Step 5: Set Environment Variables (if needed)

If you need to set environment variables:

```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-secret-key-here
railway variables set CLIENT_URL=https://carassauga-app.web.app
```

## Step 6: Update Frontend with API URL

Once you have your Railway API URL, update the frontend:

1. Edit `/Users/oscarbello/Desktop/files/client/.env.production`:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app/api
   ```

2. Rebuild and redeploy the frontend:
   ```bash
   cd /Users/oscarbello/Desktop/files
   npm run build:client
   firebase deploy --only hosting --project carassauga-app
   ```

## Troubleshooting

- **Check logs**: `railway logs`
- **View deployment status**: `railway status`
- **Redeploy**: `railway up`
