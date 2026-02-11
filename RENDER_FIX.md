# Render Deployment Fix

## Problem
Render is detecting the monorepo structure and trying to build both client and server, causing build failures.

## Solution: Manual Configuration in Render Dashboard

Since Render is auto-detecting the workspace structure, we need to configure it manually in the dashboard:

### Step 1: Go to Render Dashboard
1. Open your service: `carassauga-portugal-pavilion`
2. Go to **Settings** tab

### Step 2: Update Build & Deploy Settings

**Root Directory:**
```
server
```

**Build Command:**
```
npm ci --no-workspaces
```

**Start Command:**
```
npx ts-node --transpile-only src/server.ts
```

**Node Version:**
```
18
```
(Or leave as default, but 18 is recommended)

### Step 3: Environment Variables

Make sure these are set in the **Environment** tab:

```
NODE_ENV=production
PORT=10000
CLIENT_URL=https://carassauga-app.web.app
JWT_SECRET=<your-secret>
JWT_REFRESH_SECRET=<your-secret>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### Step 4: Save and Redeploy

1. Click **Save Changes**
2. Go to **Manual Deploy** → **Deploy latest commit**
3. Wait for deployment to complete

## Alternative: Fix render.yaml (if using Blueprint)

If you're using Render Blueprint, the render.yaml should work, but Render might need to be told to use npm instead of yarn.

Try updating the service settings to use npm explicitly.
