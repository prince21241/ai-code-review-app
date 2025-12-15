# AI Code Review Setup Guide

This app supports multiple free AI providers for code reviews. Choose one:

## 🚀 Option 1: Groq API (Recommended - Fastest & Easiest)

**Free Tier:** 14,400 requests/day

1. **Get API Key:**
   - Go to https://console.groq.com/
   - Sign up (free)
   - Create an API key

2. **Set Environment Variable:**
   ```bash
   # Windows PowerShell
   $env:GROQ_API_KEY="your-api-key-here"
   
   # Or create a .env file in backend/:
   GROQ_API_KEY=your-api-key-here
   AI_REVIEW_PROVIDER=groq
   ```

3. **Install Dependencies:**
   ```bash
   cd backend
   .venv\Scripts\Activate
   pip install groq requests
   ```

4. **Done!** The app will automatically use Groq for reviews.

---

## 🏠 Option 2: Ollama (Completely Free, Local)

**Pros:** No API limits, completely private, free forever  
**Cons:** Requires local setup, slower than cloud APIs

1. **Install Ollama:**
   - Download from https://ollama.ai/
   - Install and run it

2. **Pull a Code Model:**
   ```bash
   ollama pull codellama
   # Or try: ollama pull deepseek-coder
   # Or: ollama pull mistral
   ```

3. **Set Environment Variable:**
   ```bash
   # Windows PowerShell
   $env:AI_REVIEW_PROVIDER="ollama"
   $env:OLLAMA_MODEL="codellama"  # Optional, defaults to codellama
   
   # Or in .env file:
   AI_REVIEW_PROVIDER=ollama
   OLLAMA_MODEL=codellama
   ```

4. **Install Dependencies:**
   ```bash
   pip install requests
   ```

5. **Done!** Reviews will run locally.

---

## 🌟 Option 3: Google Gemini (Free Tier)

**Free Tier:** 60 requests/minute, generous daily limits

### Step-by-Step Guide to Get Gemini API Key:

1. **Visit Google AI Studio:**
   - Go to: **https://aistudio.google.com/app/apikey**
   - (Alternative: https://makersuite.google.com/app/apikey - may redirect)

2. **Sign In:**
   - Sign in with your Google account
   - Accept terms if prompted

3. **Create API Key:**
   - Click **"Create API Key"** or **"Get API Key"** button
   - You may be asked to select a Google Cloud project:
     - Choose an existing project, OR
     - Click **"Create API Key in New Project"** (recommended for beginners)
   - Your API key will be displayed immediately
   - **⚠️ IMPORTANT:** Copy the key right away - you won't see it again!
   - It looks like: `AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567`

4. **Set Environment Variable:**
   ```powershell
   # Windows PowerShell (temporary - for current session)
   $env:GEMINI_API_KEY="AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567"
   $env:AI_REVIEW_PROVIDER="gemini"
   ```
   
   **OR create a `.env` file in `backend/` directory** (recommended):
   ```env
   GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
   AI_REVIEW_PROVIDER=gemini
   ```

5. **Install Dependencies:**
   ```bash
   cd backend
   .venv\Scripts\Activate
   pip install requests
   ```

6. **Restart Your Worker:**
   ```bash
   python -m app.worker
   ```

### Free Tier Limits:
- **60 requests per minute**
- **1,500 requests per day** (approximately)
- No credit card required for free tier

### Troubleshooting:
- If you see "API key not valid", make sure you copied the entire key
- If you lost your key, go back to https://aistudio.google.com/app/apikey and create a new one
- Make sure the `.env` file is in the `backend/` directory (same level as `requirements.txt`)

---

## 🔄 Fallback Behavior

If AI review fails (API error, network issue, etc.), the app automatically falls back to the basic rule-based review. No errors will be shown to users.

---

## 📝 Environment Variables Summary

Create a `.env` file in `backend/` directory:

```env
# Choose one AI provider: groq, ollama, or gemini
AI_REVIEW_PROVIDER=groq

# Groq (if using groq)
GROQ_API_KEY=your-groq-api-key

# Gemini (if using gemini)
GEMINI_API_KEY=your-gemini-api-key

# Ollama (if using ollama)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=codellama

# Database (already configured)
DATABASE_URL=postgresql+psycopg2://acra:acra@localhost:5432/acra

# Redis (already configured)
REDIS_URL=redis://localhost:6379/0
```

---

## 🧪 Testing

After setup, submit code through the UI. The review should now use AI instead of basic rules!

