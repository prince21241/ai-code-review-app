# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for both frontend and backend.

## 🔑 Get Your Clerk Keys

1. **Sign up/Login to Clerk:**
   - Go to https://clerk.com/
   - Create an account or sign in

2. **Create a New Application:**
   - Click "Create Application"
   - Choose your preferred sign-in methods (Email, Google, GitHub, etc.)

3. **Get Your API Keys:**
   - Go to **API Keys** in your Clerk Dashboard
   - Copy your **Publishable Key** (starts with `pk_`)
   - Copy your **Secret Key** (starts with `sk_`)

## 📝 Frontend Setup

1. **Create `.env.local` file in `frontend/` directory:**
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```

2. **Restart your frontend dev server:**
   ```bash
   cd frontend
   npm run dev
   ```

## 🔧 Backend Setup

1. **Add to `backend/.env` file (or create it):**
   ```env
   CLERK_SECRET_KEY=sk_test_your_secret_key_here
   ```

2. **Restart your backend server:**
   ```bash
   cd backend
   .venv\Scripts\Activate
   uvicorn app.main:app --reload --port 8000
   ```

## ✅ Verification

1. **Frontend:**
   - You should see "Sign In" and "Sign Up" buttons in the header
   - Clicking them opens Clerk's authentication modal
   - After signing in, you'll see the UserButton

2. **Backend:**
   - API requests will include authentication tokens
   - Currently, authentication is optional (graceful degradation)
   - To require authentication, update routes to use `get_current_user_required`

## 🚀 Features

- ✅ Sign In / Sign Up buttons in header
- ✅ User profile button after authentication
- ✅ Protected content (only visible when signed in)
- ✅ API requests include authentication tokens
- ✅ Graceful degradation (works without auth configured)

## 📚 Documentation

- Clerk React Docs: https://clerk.com/docs/react/getting-started/quickstart
- Clerk Python Docs: https://clerk.com/docs/backend-requests/overview

## 🔒 Production Notes

For production, you should:
1. Implement proper JWT verification using Clerk's JWKS endpoint
2. Require authentication for all API routes
3. Store keys securely (use environment variables, never commit to git)
4. Add `.env.local` and `.env` to `.gitignore`

