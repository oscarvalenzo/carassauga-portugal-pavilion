# Firebase Hosting Deployment Guide

This guide will help you deploy the Carassauga Portugal Pavilion client to Firebase Hosting.

## Prerequisites

1. **Firebase Account**: Sign up at [https://firebase.google.com](https://firebase.google.com)
2. **Firebase CLI**: Install globally using npm:
   ```bash
   npm install -g firebase-tools
   ```

## Setup Steps

### 1. Login to Firebase

```bash
firebase login
```

This will open a browser window for authentication.

### 2. Initialize Firebase Project (if not already done)

```bash
firebase init hosting
```

When prompted:
- **Select an existing project** or create a new one
- **Public directory**: `client/dist`
- **Configure as single-page app**: Yes
- **Set up automatic builds**: No (we'll build manually)
- **Overwrite index.html**: No

### 3. Update Project ID (if needed)

Edit `.firebaserc` and change the project ID to match your Firebase project:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

## Deployment

### Build and Deploy

From the root directory:

```bash
# Build the client
npm run build:client

# Deploy to Firebase
npm run deploy:client:firebase
```

Or use the shorter command:
```bash
npm run firebase:deploy
```

### Test Locally Before Deploying

```bash
# Build first
npm run build:client

# Serve locally
npm run firebase:serve
```

Then visit `http://localhost:5000` to preview your site.

## Environment Variables

If you need environment variables for production, you can:

1. **Create a `.env.production` file** in the `client` directory:
   ```
   VITE_API_URL=https://your-api-url.com/api
   ```

2. **Or set them in Firebase Hosting** (requires Firebase Functions):
   - Use Firebase Functions to inject environment variables
   - Or use Firebase Remote Config for runtime configuration

## Custom Domain

To add a custom domain:

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Continuous Deployment (GitHub Actions)

A GitHub Actions workflow is already configured at `.github/workflows/firebase-deploy.yml`.

### Setup GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

1. **FIREBASE_SERVICE_ACCOUNT**: 
   - Get from Firebase Console → Project Settings → Service Accounts
   - Generate new private key and copy the JSON content
   - Paste as secret value

2. **FIREBASE_PROJECT_ID**: 
   - Your Firebase project ID (e.g., `carassauga-portugal-pavilion`)

3. **VITE_API_URL** (optional):
   - Your production API URL

### Manual Deployment

If you prefer manual deployment:

```bash
# Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Build the client
npm run build:client

# Deploy
npm run firebase:deploy
```

## Troubleshooting

### Build fails
- Make sure all dependencies are installed: `cd client && npm install`
- Check for TypeScript errors: `cd client && npm run build`

### Deployment fails
- Verify Firebase login: `firebase login`
- Check project ID in `.firebaserc` matches your Firebase project
- Ensure `client/dist` directory exists after building

### Map not loading
- Leaflet uses OpenStreetMap (free, no API key needed)
- If you want to use a different map service, update `LeafletMap.tsx`

## Useful Commands

```bash
# View deployment history
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback

# View current deployments
firebase hosting:sites:list
```
