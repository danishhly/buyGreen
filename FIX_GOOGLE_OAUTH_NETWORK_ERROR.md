# Fix: Google OAuth Network Error

## ❌ Problem

After clicking a Google account, you see:
- "Network error. Please check your internet connection."
- Cannot sign in with Google

## 🔍 Root Causes

1. **CORS Configuration**: Backend doesn't allow Vercel URLs
2. **Missing Environment Variable**: `VITE_API_BASE_URL` not set in Vercel
3. **Backend URL**: Frontend trying to connect to `localhost:8080` instead of Render backend

## ✅ Solution

### Step 1: Set CORS in Render (Backend)

1. **Go to Render Dashboard** → Your backend service
2. **Go to Environment** tab
3. **Add Environment Variable:**
   - **Key:** `CORS_ALLOWED_ORIGINS`
   - **Value:** `https://buygreen.vercel.app,https://buygreen-7t55qv105-danishhlys-projects.vercel.app,http://localhost:5173,http://localhost:5174`
   - **Note:** Add all your Vercel URLs (production + preview URLs)
4. **Click "Save Changes"**
5. **Redeploy** your backend service

### Step 2: Set API URL in Vercel (Frontend)

1. **Go to Vercel Dashboard** → Your frontend project
2. **Go to Settings → Environment Variables**
3. **Add Environment Variable:**
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://your-backend-url.onrender.com` (replace with your actual Render backend URL)
   - **Environments:** Select all (Production, Preview, Development)
4. **Click "Save"**
5. **Redeploy** your frontend

### Step 3: Verify Backend is Running

1. **Check Render Dashboard** → Your backend service
2. **Verify it's "Live"** (green status)
3. **Test the endpoint:**
   - Open: `https://your-backend-url.onrender.com/api/customers/test`
   - Should return a response (even if it's an error, it means the server is reachable)

### Step 4: Check Browser Console

1. **Open your Vercel site** (e.g., `https://buygreen.vercel.app`)
2. **Open Browser DevTools** (F12)
3. **Go to Console tab**
4. **Try Google sign-in**
5. **Check console logs:**
   - Should see: "Sending Google token to backend..."
   - Should see: "API Base URL: https://your-backend-url.onrender.com"
   - If you see errors, they'll show what's wrong

## 📋 Complete Environment Variables Checklist

### Render (Backend):
- ✅ `CORS_ALLOWED_ORIGINS` = `https://buygreen.vercel.app,https://buygreen-7t55qv105-danishhlys-projects.vercel.app,http://localhost:5173,http://localhost:5174`
- ✅ `MYSQLHOST` = (your Railway external hostname)
- ✅ `MYSQLPORT` = (your Railway port)
- ✅ `MYSQLDATABASE` = (your database name)
- ✅ `MYSQLUSER` = (your database user)
- ✅ `MYSQLPASSWORD` = (your database password)
- ✅ `GOOGLE_CLIENTID` = `189236141996-658di7k0m2fuf4taqpn45uep5ivjgdi3.apps.googleusercontent.com`
- ✅ `JWT_SECRET` = (your JWT secret)
- ✅ `RAZORPAY_KEYID` = (your Razorpay key)
- ✅ `RAZORPAY_SECRET` = (your Razorpay secret)
- ✅ `MAIL_USERNAME` = (your email)
- ✅ `MAIL_PASSWORD` = (your email app password)
- ✅ `FRONTEND_URL` = `https://buygreen.vercel.app`

### Vercel (Frontend):
- ✅ `VITE_API_BASE_URL` = `https://your-backend-url.onrender.com`
- ✅ `VITE_GOOGLE_CLIENT_ID` = `189236141996-658di7k0m2fuf4taqpn45uep5ivjgdi3.apps.googleusercontent.com`

## 🔧 Testing

After setting all environment variables:

1. **Redeploy both services** (Render backend + Vercel frontend)
2. **Wait for deployments to complete**
3. **Clear browser cache** or use incognito mode
4. **Try Google sign-in again**
5. **Check browser console** for detailed error messages

## 🐛 Debugging

If it still doesn't work:

1. **Check browser console** for specific error messages
2. **Check Network tab** in DevTools:
   - Look for the `/auth/google` request
   - Check if it's being blocked (CORS error)
   - Check the response status code
3. **Check Render logs** for backend errors
4. **Verify backend URL** is correct in Vercel environment variables

---

**Most common issue: Missing `VITE_API_BASE_URL` in Vercel or missing `CORS_ALLOWED_ORIGINS` in Render!**

