# Snackky Deployment Guide

Complete guide to deploying Snackky to production using Vercel (frontend) and Railway (backend).

---

## Prerequisites

- GitHub account
- MongoDB Atlas account (free tier)
- Vercel account (free tier)
- Railway account (free tier)

---

## Part 1: MongoDB Atlas Setup

### 1. Create MongoDB Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Click "Build a Database"
4. Choose **Shared** (Free)
5. Provider: **AWS**
6. Region: **Mumbai** (ap-south-1) - closest to Indian users
7. Cluster Name: `snackky-db`
8. Click **Create**

### 2. Configure Database Access

1. Go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Authentication Method: **Password**
4. Username: `snackky_admin`
5. Password: Click **Autogenerate Secure Password** (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### 3. Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere**
4. IP Address: `0.0.0.0/0`
5. Comment: "Allow Vercel/Railway"
6. Click **Confirm**

### 4. Get Connection String

1. Go to **Database** (left sidebar)
2. Click **Connect** button on your cluster
3. Choose **Connect your application**
4. Driver: **Node.js** / Version: **4.1 or later**
5. Copy the connection string:
   ```
   mongodb+srv://snackky_admin:<password>@snackky-db.xxxxx.mongodb.net/
   ```
6. Replace `<password>` with the password you saved earlier
7. Add database name at the end: `/snackky`
8. Final string should look like:
   ```
   mongodb+srv://snackky_admin:YOUR_PASSWORD@snackky-db.xxxxx.mongodb.net/snackky?retryWrites=true&w=majority
   ```
9. **Save this connection string!** You'll need it soon.

---

## Part 2: Deploy Backend to Railway

### 1. Sign Up for Railway

1. Go to https://railway.app
2. Click **Login with GitHub**
3. Authorize Railway

### 2. Create New Project

1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Choose your `snackky` repository
4. Click **Deploy Now**

### 3. Configure Service

1. Click on the deployed service
2. Go to **Settings**
3. **Service Name:** `snackky-backend`
4. **Root Directory:** `/backend`
5. **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`

### 4. Add Environment Variables

1. Go to **Variables** tab
2. Click **New Variable**
3. Add these variables:

   **MONGODB_URL:**
   ```
   mongodb+srv://snackky_admin:YOUR_PASSWORD@snackky-db.xxxxx.mongodb.net/snackky
   ```
   
   **PORT:**
   ```
   8000
   ```
   
   **CORS_ORIGINS:**
   ```
   https://your-frontend-url.vercel.app,http://localhost:3000
   ```
   (We'll update this after deploying frontend)

4. Click **Save**

### 5. Deploy

1. Railway will automatically deploy
2. Wait 2-3 minutes
3. Go to **Settings** tab
4. Scroll to **Domains**
5. Click **Generate Domain**
6. You'll get a URL like: `https://snackky-backend-production.up.railway.app`
7. **Save this URL!** This is your backend URL.

---

## Part 3: Deploy Frontend to Vercel

### 1. Sign Up for Vercel

1. Go to https://vercel.com
2. Click **Sign Up**
3. Choose **Continue with GitHub**
4. Authorize Vercel

### 2. Import Project

1. Click **Add New...** → **Project**
2. Find your `snackky` repository
3. Click **Import**

### 3. Configure Project

**Framework Preset:** Create React App

**Root Directory:** `frontend`

**Build and Output Settings:**
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

**Environment Variables:**

Click **Add** and add:

- **Name:** `REACT_APP_API_URL`
- **Value:** `https://snackky-backend-production.up.railway.app`
  (Use your Railway backend URL from Part 2)

### 4. Deploy

1. Click **Deploy**
2. Wait 2-3 minutes
3. You'll get a URL like: `https://snackky-abc123.vercel.app`
4. **This is your live app URL!**

### 5. Update Backend CORS

1. Go back to Railway
2. Open your backend service
3. Go to **Variables**
4. Update **CORS_ORIGINS** to include your Vercel URL:
   ```
   https://snackky-abc123.vercel.app,http://localhost:3000
   ```
5. Railway will automatically redeploy

---

## Part 4: Test Your Deployment

### 1. Open Your App

Go to your Vercel URL: `https://snackky-abc123.vercel.app`

### 2. Test Core Features

- [ ] Can enter name and start
- [ ] Can create a group
- [ ] Can get invite link
- [ ] Can join group via invite link
- [ ] Can create challenge
- [ ] Can play game
- [ ] Leaderboard shows correctly
- [ ] All data persists (refresh page, data still there)

### 3. Check for Errors

**If something doesn't work:**

1. **Check Frontend Logs:**
   - Vercel Dashboard → Your Project → Deployments → Latest → View Function Logs
   
2. **Check Backend Logs:**
   - Railway Dashboard → Your Service → Deployments → View Logs
   
3. **Common Issues:**
   - **Can't connect to backend:** Check CORS_ORIGINS includes your Vercel URL
   - **MongoDB errors:** Check connection string is correct
   - **Build fails:** Check all dependencies are in package.json

---

## Part 5: Custom Domain (Optional)

### Add Your Own Domain

1. **Buy a domain** (from Namecheap, GoDaddy, etc.)
2. **In Vercel:**
   - Go to your project Settings
   - Click **Domains**
   - Add your domain (e.g., `snackky.com`)
   - Follow DNS configuration instructions
3. **Update Railway CORS:**
   - Add your custom domain to CORS_ORIGINS
   - Example: `https://snackky.com,http://localhost:3000`

---

## Part 6: Ongoing Updates

### How to Deploy Changes

1. **Make changes locally**
2. **Test locally:**
   ```bash
   # Frontend
   cd frontend
   npm start
   
   # Backend (separate terminal)
   cd backend
   python server.py
   ```
3. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Your change description"
   git push origin main
   ```
4. **Auto-deploy:**
   - Vercel automatically deploys frontend changes
   - Railway automatically deploys backend changes
   - Usually takes 2-3 minutes

---

## Monitoring & Maintenance

### Free Tier Limits

**Vercel:**
- 100 GB bandwidth/month
- Unlimited deployments
- 100 GB-hours serverless function execution

**Railway:**
- $5 free credit/month
- Enough for ~500 hours of uptime
- Usually sufficient for small apps

**MongoDB Atlas:**
- 512 MB storage (enough for ~10,000 users)
- Shared CPU/RAM
- No time limit

### Monitor Usage

1. **Vercel:** Dashboard shows bandwidth usage
2. **Railway:** Dashboard shows credit usage
3. **MongoDB:** Database page shows storage usage

---

## Troubleshooting

### Frontend Issues

**Problem:** App loads but shows errors  
**Solution:** Check browser console (F12) for errors

**Problem:** Can't connect to backend  
**Solution:** Verify REACT_APP_API_URL is correct in Vercel env variables

### Backend Issues

**Problem:** Railway shows "Application Failed to Respond"  
**Solution:** Check start command is correct: `uvicorn server:app --host 0.0.0.0 --port $PORT`

**Problem:** CORS errors  
**Solution:** Add your frontend URL to CORS_ORIGINS in Railway

### Database Issues

**Problem:** "Authentication failed"  
**Solution:** Check MongoDB password in connection string

**Problem:** "IP not whitelisted"  
**Solution:** Add 0.0.0.0/0 to Network Access in MongoDB Atlas

---

## Need Help?

Common resources:
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- MongoDB Atlas Docs: https://www.mongodb.com/docs/atlas

---

**Congratulations! Your app is live! 🎉**

Share your URL with friends and start playing!
