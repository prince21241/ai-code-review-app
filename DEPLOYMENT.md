# 🚀 Free Deployment Guide

This guide covers multiple free deployment options for your AI Code Review App.

## 📋 Architecture Overview

- **Frontend**: React/Vite (static site)
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Cache/Queue**: Redis
- **Worker**: RQ worker for processing reviews

---

## 🎯 Option 1: Railway (Recommended - Easiest)

**Free Tier**: $5 credit/month (enough for small apps)

### Why Railway?
- ✅ Deploys everything in one place
- ✅ Free PostgreSQL and Redis included
- ✅ Automatic HTTPS
- ✅ Easy environment variable management
- ✅ GitHub integration

### Steps:

#### 1. Deploy Backend + Database + Redis

1. **Sign up**: Go to [railway.app](https://railway.app) and sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL**:
   - Click "+ New" → "Database" → "Add PostgreSQL"
   - Railway will auto-create `DATABASE_URL` environment variable

4. **Add Redis**:
   - Click "+ New" → "Database" → "Add Redis"
   - Railway will auto-create `REDIS_URL` environment variable

5. **Configure Backend Service**:
   - Click "+ New" → "GitHub Repo" → Select your repo
   - Set **Root Directory**: `backend`
   - Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Railway auto-detects Python and installs from `requirements.txt`

6. **Add Environment Variables**:
   ```
   CLERK_SECRET_KEY=sk_test_...
   AI_REVIEW_PROVIDER=gemini
   GEMINI_API_KEY=your_key_here
   # DATABASE_URL and REDIS_URL are auto-added by Railway
   ```

7. **Deploy Worker** (separate service):
   - Click "+ New" → "GitHub Repo" → Select your repo
   - Set **Root Directory**: `backend`
   - Set **Start Command**: `python -m app.worker`
   - Add same environment variables as backend

8. **Get Backend URL**:
   - Railway provides a URL like: `https://your-app.up.railway.app`
   - Copy this URL

#### 2. Deploy Frontend (Vercel)

1. **Sign up**: Go to [vercel.com](https://vercel.com) and sign up with GitHub

2. **Import Project**:
   - Click "Add New Project"
   - Import your GitHub repository
   - Set **Root Directory**: `frontend`
   - Framework Preset: **Vite**

3. **Add Environment Variables**:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   VITE_API_URL=https://your-backend.up.railway.app
   ```

4. **Update Frontend Code**:
   - Update API URLs in `App.jsx` to use `import.meta.env.VITE_API_URL`
   - Deploy!

---

## 🎯 Option 2: Render (100% Free Tier)

**Free Tier**: Free PostgreSQL, Redis, and web services (with limitations)

### Steps:

#### 1. Deploy Backend

1. **Sign up**: [render.com](https://render.com)

2. **Create PostgreSQL Database**:
   - Dashboard → "New +" → "PostgreSQL"
   - Name: `acra-db`
   - Copy the **Internal Database URL**

3. **Create Redis Instance**:
   - Dashboard → "New +" → "Redis"
   - Name: `acra-redis`
   - Copy the **Internal Redis URL**

4. **Create Web Service** (Backend):
   - Dashboard → "New +" → "Web Service"
   - Connect your GitHub repo
   - Settings:
     - **Name**: `acra-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**:
     ```
     DATABASE_URL=<from PostgreSQL service>
     REDIS_URL=<from Redis service>
     CLERK_SECRET_KEY=sk_test_...
     AI_REVIEW_PROVIDER=gemini
     GEMINI_API_KEY=your_key_here
     ```

5. **Create Background Worker**:
   - Dashboard → "New +" → "Background Worker"
   - Connect same GitHub repo
   - Settings:
     - **Root Directory**: `backend`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `python -m app.worker`
   - Same environment variables as backend

#### 2. Deploy Frontend

1. **Create Static Site**:
   - Dashboard → "New +" → "Static Site"
   - Connect GitHub repo
   - Settings:
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
     VITE_API_URL=https://acra-backend.onrender.com
     ```

**Note**: Render free tier services spin down after 15 minutes of inactivity. First request may be slow.

---

## 🎯 Option 3: Fly.io (Free Tier)

**Free Tier**: 3 shared VMs, 3GB storage, 160GB outbound data

### Steps:

1. **Install Fly CLI**: `curl -L https://fly.io/install.sh | sh`

2. **Login**: `fly auth login`

3. **Deploy Backend**:
   ```bash
   cd backend
   fly launch
   # Follow prompts, then:
   fly postgres create --name acra-db
   fly redis create --name acra-redis
   fly secrets set CLERK_SECRET_KEY=sk_test_...
   fly secrets set AI_REVIEW_PROVIDER=gemini
   fly secrets set GEMINI_API_KEY=your_key_here
   ```

4. **Deploy Worker**:
   ```bash
   fly launch --name acra-worker
   fly secrets set DATABASE_URL=...
   fly secrets set REDIS_URL=...
   ```

5. **Deploy Frontend** (Vercel/Netlify):
   - Same as Option 1

---

## 🎯 Option 4: Split Deployment (Most Free)

- **Frontend**: Vercel (free, unlimited)
- **Backend**: PythonAnywhere (free tier) or Render
- **Database**: Supabase (free PostgreSQL)
- **Redis**: Upstash (free Redis)

### Steps:

#### 1. Supabase (Free PostgreSQL)

1. Sign up: [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy **Connection String** (use pooling URL)

#### 2. Upstash (Free Redis)

1. Sign up: [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy **Redis URL**

#### 3. Deploy Backend (PythonAnywhere)

1. Sign up: [pythonanywhere.com](https://www.pythonanywhere.com)
2. Upload your code
3. Set environment variables in Web app config
4. Point to Supabase and Upstash URLs

#### 4. Deploy Frontend (Vercel)

Same as Option 1

---

## 🔧 Required Configuration Changes

### Backend Changes Needed:

1. **Update CORS** in `backend/app/main.py`:
   ```python
   allow_origins=[
       "http://localhost:5173",
       "https://your-frontend.vercel.app",  # Add your frontend URL
   ]
   ```

2. **Update WebSocket URL** in frontend if using WebSockets

### Frontend Changes Needed:

1. **Update API URLs** in `frontend/src/App.jsx`:
   ```javascript
   // Replace hardcoded localhost URLs
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
   const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
   ```

---

## 📝 Environment Variables Checklist

### Backend:
- ✅ `DATABASE_URL` (auto-provided by hosting)
- ✅ `REDIS_URL` (auto-provided by hosting)
- ✅ `CLERK_SECRET_KEY`
- ✅ `AI_REVIEW_PROVIDER` (groq/gemini/ollama)
- ✅ `GEMINI_API_KEY` or `GROQ_API_KEY` (depending on provider)

### Frontend:
- ✅ `VITE_CLERK_PUBLISHABLE_KEY`
- ✅ `VITE_API_URL` (your backend URL)
- ✅ `VITE_WS_URL` (your WebSocket URL, if different)

---

## 🚀 Quick Start: Railway (Recommended)

1. **Backend**: Railway (includes DB + Redis)
2. **Frontend**: Vercel
3. **Total Cost**: $0/month (within free tier limits)

**Estimated Setup Time**: 15-20 minutes

---

## 💡 Tips

1. **Use Railway** for easiest full-stack deployment
2. **Use Vercel** for frontend (best performance)
3. **Monitor usage** to stay within free tier limits
4. **Set up alerts** for when services go down
5. **Use environment variables** for all secrets
6. **Enable CORS** properly for production

---

## 🆘 Troubleshooting

### Backend won't start:
- Check environment variables are set
- Verify DATABASE_URL format: `postgresql://user:pass@host:port/db`
- Check logs in hosting dashboard

### Frontend can't connect to backend:
- Update CORS origins in backend
- Check backend URL is correct
- Verify environment variables in frontend

### Database connection errors:
- Check DATABASE_URL format
- Verify database is running
- Check firewall/network settings

---

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Fly.io Docs](https://fly.io/docs)

