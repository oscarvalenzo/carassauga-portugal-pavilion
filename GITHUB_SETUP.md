# GitHub Setup Instructions

## Step 1: Create GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. Fill in:
   - **Repository name**: `carassauga-portugal-pavilion` (or any name you prefer)
   - **Description**: "Carassauga Portugal Pavilion Digital Experience Platform"
   - **Visibility**: Choose **Public** or **Private**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click **"Create repository"**

## Step 2: Copy Your Repository URL

After creating the repository, GitHub will show you a URL like:
- `https://github.com/your-username/carassauga-portugal-pavilion.git`

Copy this URL - you'll need it in the next step!

## Step 3: Push Your Code

Run these commands in your terminal (replace `YOUR_GITHUB_URL` with the URL from Step 2):

```bash
cd /Users/oscarbello/Desktop/files
git remote add origin YOUR_GITHUB_URL
git branch -M main
git push -u origin main
```

For example, if your URL is `https://github.com/oscarbello/carassauga-portugal-pavilion.git`:
```bash
git remote add origin https://github.com/oscarbello/carassauga-portugal-pavilion.git
git branch -M main
git push -u origin main
```

## Step 4: Verify

1. Go back to your GitHub repository page
2. You should see all your files uploaded
3. Your code is now on GitHub! 🎉

## Next Steps

Once your code is on GitHub:
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Connect your GitHub account
3. Select your repository
4. Follow the Render deployment guide!
