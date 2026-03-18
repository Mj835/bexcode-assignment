# BexCode - GitHub & Vercel Setup Guide

## 📋 Prerequisites

- GitHub account (https://github.com)
- Vercel account (https://vercel.com)
- Git installed locally
- Node.js 18+

---

## Step 1️⃣: Initialize Git Repository

```bash
# Navigate to project root
cd c:/MJ\ Files/BoxCoder-Assignment

# Initialize git
git init

# Add all files (respecting .gitignore)
git add .

# Commit initial code
git commit -m "Initial commit: BexCode Health Consultation system"

# Verify git status
git status
```

---

## Step 2️⃣: Create GitHub Repository

### Option A: Using GitHub Web UI (Recommended)

1. Go to https://github.com/new
2. Repository name: `bexcode-health-consultation`
3. Description: `Full-stack health consultation intake system`
4. Choose **Public** or **Private**
5. Click **Create repository**

### Option B: Using GitHub CLI

```bash
# Install GitHub CLI: https://cli.github.com
gh auth login
gh repo create bexcode-health-consultation --public --source=. --remote=origin --push
```

---

## Step 3️⃣: Connect Local Repository to GitHub

```bash
# Add remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/bexcode-health-consultation.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Verify Connection

```bash
git remote -v
# Should show:
# origin  https://github.com/YOUR_USERNAME/bexcode-health-consultation.git (fetch)
# origin  https://github.com/YOUR_USERNAME/bexcode-health-consumption.git (push)
```

---

## Step 4️⃣: Deploy Frontend to Vercel

### Option A: Using Vercel Web Dashboard (Easiest)

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your GitHub repository: `bexcode-health-consultation`
4. Configure project:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   ```
   VITE_API_URL = https://bexcode-api.vercel.app/api
   ```
   (Use the backend URL you'll create in next step)
6. Click **Deploy**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy frontend
cd frontend
vercel --prod
```

**Save the frontend URL**: https://bexcode.vercel.app

---

## Step 5️⃣: Deploy Backend to Vercel

### Option A: Using Vercel Web Dashboard

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your GitHub repository again: `bexcode-health-consultation`
4. Configure project:
   - **Framework**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://bexcode.vercel.app`)
   - `NODE_ENV`: `production`
   - `PORT`: `3000` (Vercel sets this automatically, but you can specify)
6. Click **Deploy**

### Option B: Using Vercel CLI

```bash
# Deploy backend
cd backend
vercel --prod
```

**Save the backend URL**: https://bexcode-api.vercel.app

---

## Step 6️⃣: Configure MongoDB Atlas (Database)

### 1. Create MongoDB Atlas Account

- Go to https://www.mongodb.com/cloud/atlas
- Click **Sign Up**
- Create free account

### 2. Create Cluster

- Click **+ Create** → **Database**
- Choose **M0 (Free Forever)** tier
- Select your region (closest to you)
- Click **Create**

### 3. Create Database User

- Go to **Database Access**
- Click **+ Add Database User**
- Choose **Password** authentication
- Username: `admin`
- Auto-generate password (copy it)
- Click **Add User**

### 4. Whitelist IP

- Go to **Network Access**
- Click **+ Add IP Address**
- Select **Allow access from anywhere** (for development)
- For production, whitelist Vercel IPs: `0.0.0.0/0`

### 5. Get Connection String

- Go to **Clusters** → **Connect** → **Connect your application**
- Copy connection string, replace:
  - `<password>` with your database user password
  - `myFirstDatabase` with `consultations`

Example:

```
mongodb+srv://admin:password123@cluster0.xxxxx.mongodb.net/consultations?retryWrites=true&w=majority
```

---

## Step 7️⃣: Update Environment Variables

### Update Frontend (.env in Vercel)

```
VITE_API_URL=https://bexcode-api.vercel.app/api
```

### Update Backend (.env in Vercel)

```
MONGODB_URI=mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/consultations
CORS_ORIGIN=https://bexcode.vercel.app
NODE_ENV=production
```

#### How to Add in Vercel Dashboard:

1. Go to Your Project → **Settings** → **Environment Variables**
2. Add each variable
3. Select which environments (Production/Preview/Development)
4. Click **Save**
5. **Redeploy** the project from **Deployments** tab

---

## Step 8️⃣: Setup GitHub Secrets (for CI/CD)

Optional but recommended for automated deployments.

### Add Secrets to GitHub

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add:

| Secret Name                  | Value                                               | Where to get it         |
| ---------------------------- | --------------------------------------------------- | ----------------------- |
| `VERCEL_TOKEN`               | [Copy from here](https://vercel.com/account/tokens) | Vercel Account Settings |
| `VERCEL_ORG_ID`              | From Vercel project settings                        | Vercel Project Settings |
| `VERCEL_PROJECT_ID_FRONTEND` | From Vercel project settings                        | Vercel Frontend Project |
| `VERCEL_PROJECT_ID_BACKEND`  | From Vercel project settings                        | Vercel Backend Project  |

### Get Vercel Project IDs

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Get IDs (they're in .vercel/project.json after first deployment)
cat .vercel/project.json
```

---

## Step 9️⃣: Test Deployment

### Test Frontend

```bash
curl https://bexcode.vercel.app
# Should return HTML
```

### Test Backend Health

```bash
curl https://bexcode-api.vercel.app/api/health
# Should return: {"success":true,"data":{"message":"API is running"},...}
```

### Test Full Submission

```bash
curl -X POST https://bexcode-api.vercel.app/api/consultations \
  -H "Content-Type: application/json" \
  -d '{
    "userDetails": {
      "fullName": "Test User",
      "email": "test@example.com",
      "phone": "5551234567",
      "dateOfBirth": "1990-01-15"
    },
    "responses": [
      {
        "questionId": "q1",
        "questionType": "radio",
        "answer": "Yes"
      }
    ],
    "metadata": {
      "timezone": "America/New_York",
      "submittedAt": "2026-03-18T16:30:00.000Z"
    }
  }'
# Should return: {"success":true,"data":{"id":"...","message":"..."},...}
```

---

## 🔄 Updating Production

After setup, just push code to update:

```bash
# Make changes locally
git add .
git commit -m "Feature: Add something new"
git push origin main
```

Vercel will automatically:

1. ✅ Build your code
2. ✅ Run tests (if configured)
3. ✅ Deploy to production

---

## 🐛 Troubleshooting

### CORS Error

- **Problem**: `Access to XMLHttpRequest blocked by CORS`
- **Solution**: Update `CORS_ORIGIN` in backend to match frontend URL

### MongoDB Connection Error

- **Problem**: `connection refused`
- **Solution**:
  - Verify connection string in `MONGODB_URI`
  - Check IP whitelist in MongoDB Atlas
  - Ensure database user password is correct

### API Not Found

- **Problem**: `404 on API endpoints`
- **Solution**:
  - Verify `VITE_API_URL` in frontend matches backend URL
  - Check both projects are deployed in Vercel

### Build Fails

- **Problem**: Vercel build fails
- **Solution**:
  - Check build logs in Vercel dashboard
  - Verify `tsconfig.json` is correct
  - Ensure all dependencies are in `package.json`

---

## 📊 Monitoring Deployments

### Vercel Dashboard

- https://vercel.com/dashboard
- View logs, analytics, and deployment history
- Rollback to previous versions if needed

### GitHub Insights

- https://github.com/YOUR_USERNAME/bexcode-health-consultation
- View commits, branches, and pull requests

---

## 🎯 Next Steps

1. ✅ Initialize Git
2. ✅ Push to GitHub
3. ✅ Deploy to Vercel
4. ✅ Configure MongoDB
5. ✅ Setup environment variables
6. ✅ Add GitHub secrets (optional)
7. ✅ Test deployment
8. 📈 Monitor performance
9. 🚀 Scale as needed

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **GitHub Docs**: https://docs.github.com/

---

**Project URLs** (after deployment):

- Frontend: https://bexcode.vercel.app
- Backend API: https://bexcode-api.vercel.app
- GitHub: https://github.com/YOUR_USERNAME/bexcode-health-consultation
