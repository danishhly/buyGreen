# Fix: Google OAuth "Missing required parameter: client_id"

## ❌ Problem

The error "Missing required parameter: client_id" means the Google OAuth Client ID is not being passed to Google's sign-in flow.

## 🔍 Root Cause

The frontend reads the Google Client ID from:
```js
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
```

But this environment variable is **not set in Vercel**!

## ✅ Solution: Add Environment Variable in Vercel

### Step 1: Get Your Google Client ID

From your backend configuration, your Google Client ID is:
```
189236141996-658di7k0m2fuf4taqpn45uep5ivjgdi3.apps.googleusercontent.com
```

### Step 2: Add to Vercel

1. **Go to Vercel Dashboard** → https://vercel.com
2. **Select your frontend project** (`buygreen-fe`)
3. **Go to Settings → Environment Variables**
4. **Click "Add Environment Variable"**
5. **Add:**
   - **Name:** `VITE_GOOGLE_CLIENT_ID`
   - **Value:** `189236141996-658di7k0m2fuf4taqpn45uep5ivjgdi3.apps.googleusercontent.com`
   - **Environments:** Select all (Production, Preview, Development)
6. **Click "Save"**

### Step 3: Redeploy

1. **Go to Deployments tab**
2. **Click "Redeploy"** on the latest deployment
3. **Or push a new commit** to trigger auto-deploy

## 📋 Complete Environment Variables for Vercel

Make sure you have these set in Vercel:

```
VITE_API_BASE_URL=https://your-backend-url.onrender.com
VITE_GOOGLE_CLIENT_ID=189236141996-658di7k0m2fuf4taqpn45uep5ivjgdi3.apps.googleusercontent.com
```

## ✅ After Fixing

1. The Google sign-in button will work
2. Users can sign in with Google
3. No more "Missing required parameter: client_id" error

---

**Add `VITE_GOOGLE_CLIENT_ID` to Vercel environment variables and redeploy!**

