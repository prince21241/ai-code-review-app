# 🔐 Environment Variables Guide

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with these variables:

```env
# Database Configuration
# For local: postgresql+psycopg2://acra:acra@localhost:5432/acra
# For production: Use your hosting provider's DATABASE_URL
DATABASE_URL=postgresql+psycopg2://user:password@host:port/database

# Redis Configuration
# For local: redis://localhost:6379/0
# For production: Use your hosting provider's REDIS_URL
REDIS_URL=redis://localhost:6379/0

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# CORS Origins (comma-separated for production)
# Example: ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
ALLOWED_ORIGINS=http://localhost:5173

# AI Review Provider (choose one: groq, gemini, or ollama)
AI_REVIEW_PROVIDER=gemini

# Gemini API (if using gemini)
GEMINI_API_KEY=your_gemini_api_key_here

# Groq API (if using groq)
# GROQ_API_KEY=your_groq_api_key_here

# Ollama Configuration (if using ollama)
# OLLAMA_URL=http://localhost:11434
# OLLAMA_MODEL=codellama
```

## Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory with these variables:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# API Configuration
# For local development, leave empty (defaults to http://localhost:8000)
# For production, set to your backend URL
VITE_API_URL=http://localhost:8000

# WebSocket URL (optional, defaults to WS version of API_URL)
# VITE_WS_URL=ws://localhost:8000
```

## Production Deployment

When deploying to production platforms (Railway, Render, Vercel, etc.):

1. **Set these as environment variables in your hosting platform's dashboard**
2. **Never commit `.env` files to Git** (they're in `.gitignore`)
3. **Use platform-specific environment variable settings**

### Railway Example:
- Go to your service → "Variables" tab
- Add each variable individually
- Railway auto-provides `DATABASE_URL` and `REDIS_URL` for databases

### Vercel Example:
- Go to project → "Settings" → "Environment Variables"
- Add variables for Production, Preview, and Development
- Variables starting with `VITE_` are exposed to frontend code

## Getting API Keys

### Clerk Keys:
1. Sign up at [clerk.com](https://clerk.com)
2. Create an application
3. Go to "API Keys" in dashboard
4. Copy Publishable Key (`pk_...`) and Secret Key (`sk_...`)

### Gemini API Key:
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

### Groq API Key:
1. Sign up at [console.groq.com](https://console.groq.com)
2. Create an API key
3. Copy the key

