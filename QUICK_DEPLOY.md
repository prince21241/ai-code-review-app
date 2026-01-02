# ⚡ Quick Deploy Guide - Railway + Vercel

This is the fastest way to deploy your app for free!

## 🎯 Prerequisites

- GitHub account
- Clerk account (for authentication)
- Gemini API key (or Groq API key)

---

## 📦 Step 1: Deploy Backend on Railway (5 minutes)

1. **Go to [railway.app](https://railway.app)** and sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL Database**:
   - Click "+ New" → "Database" → "Add PostgreSQL"
   - Railway automatically creates `DATABASE_URL` environment variable

4. **Add Redis**:
   - Click "+ New" → "Database" → "Add Redis"  
   - Railway automatically creates `REDIS_URL` environment variable

5. **Configure Backend Service**:
   - Click "+ New" → "GitHub Repo" → Select your repo
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Railway will auto-detect Python and install dependencies

6. **Add Environment Variables**:
   - Click on your backend service → "Variables" tab
   - Add these variables:
     ```
     CLERK_SECRET_KEY=sk_test_your_key_here
     AI_REVIEW_PROVIDER=gemini
     GEMINI_API_KEY=your_gemini_key_here
     ALLOWED_ORIGINS=http://localhost:5173
     ```
   - Note: `DATABASE_URL` and `REDIS_URL` are auto-added by Railway

7. **Deploy Worker** (for processing reviews):
   - Click "+ New" → "GitHub Repo" → Select your repo
   - **Root Directory**: `backend`
   - **Start Command**: `python -m app.worker`
   - Add the same environment variables as the backend service

8. **Get Your Backend URL**:
   - Click on your backend service → "Settings" → "Generate Domain"
   - Copy the URL (e.g., `https://your-app.up.railway.app`)

---

## 🎨 Step 2: Deploy Frontend on Vercel (3 minutes)

1. **Go to [vercel.com](https://vercel.com)** and sign up with GitHub

2. **Import Project**:
   - Click "Add New Project"
   - Import your GitHub repository
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detected)

3. **Add Environment Variables**:
   - In project settings → "Environment Variables"
   - Add:
     ```
     VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
     VITE_API_URL=https://your-backend.up.railway.app
     ```
   - Replace `your-backend.up.railway.app` with your Railway backend URL

4. **Deploy**:
   - Click "Deploy"
   - Wait 1-2 minutes
   - Copy your frontend URL (e.g., `https://your-app.vercel.app`)

---

## 🔧 Step 3: Update CORS (2 minutes)

1. **Go back to Railway** → Your backend service

2. **Update Environment Variables**:
   - Edit `ALLOWED_ORIGINS`:
     ```
     ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
     ```
   - Replace `your-app.vercel.app` with your Vercel URL

3. **Redeploy**:
   - Railway will auto-redeploy when you save

---

## ✅ Step 4: Test Your Deployment

1. **Visit your Vercel URL**
2. **Sign in** with Clerk
3. **Submit code** for review
4. **Check reviews** appear

---

## 🎉 Done!

Your app is now live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.up.railway.app`

---

## 💰 Cost Breakdown

- **Railway**: $5 free credit/month (enough for small apps)
- **Vercel**: Free forever (with limitations)
- **Total**: $0/month (within free tier)

---

## 🆘 Troubleshooting

### Backend won't start:
- Check all environment variables are set
- Check Railway logs: Service → "Deployments" → Click latest → "View Logs"

### Frontend can't connect:
- Verify `VITE_API_URL` is correct in Vercel
- Check CORS origins include your Vercel URL
- Check browser console for errors

### Database errors:
- Verify `DATABASE_URL` is set (Railway auto-sets this)
- Check Railway PostgreSQL service is running

### Worker not processing:
- Verify worker service is running in Railway
- Check worker has same env vars as backend
- Check Redis is connected

---

## 📚 Next Steps

- Set up custom domains (optional)
- Enable monitoring/alerts
- Set up CI/CD for auto-deployments
- Scale up if needed (Railway has paid plans)

---

**Need help?** Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide for more options!

