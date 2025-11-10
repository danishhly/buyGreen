# Complete List: Vercel Environment Variables

## 📋 Required Environment Variables for Frontend (Vercel)

You need to add **2 environment variables** in Vercel:

### 1. Backend API URL
- **Name:** `VITE_API_BASE_URL`
- **Value:** `https://your-backend-url.onrender.com`
  - Replace with your actual Render backend URL
  - Example: `https://buygreen-backend.onrender.com`
- **Purpose:** Tells the frontend where to send API requests

### 2. Google OAuth Client ID
- **Name:** `VITE_GOOGLE_CLIENT_ID`
- **Value:** `189236141996-658di7k0m2fuf4taqpn45uep5ivjgdi3.apps.googleusercontent.com`
- **Purpose:** Enables Google sign-in functionality

---

## 🎯 How to Add in Vercel

1. **Go to Vercel Dashboard** → https://vercel.com
2. **Select your frontend project** (`buygreen-fe`)
3. **Go to Settings → Environment Variables**
4. **Click "Add Environment Variable"** for each one:

### Variable 1:
```
Name: VITE_API_BASE_URL
Value: https://your-backend-url.onrender.com
Environments: ☑ Production ☑ Preview ☑ Development
```

### Variable 2:
```
Name: VITE_GOOGLE_CLIENT_ID
Value: 189236141996-658di7k0m2fuf4taqpn45uep5ivjgdi3.apps.googleusercontent.com
Environments: ☑ Production ☑ Preview ☑ Development
```

5. **Click "Save"** after adding each variable
6. **Redeploy** your application

---

## 📝 Quick Copy-Paste List

```
VITE_API_BASE_URL=https://your-backend-url.onrender.com
VITE_GOOGLE_CLIENT_ID=189236141996-658di7k0m2fuf4taqpn45uep5ivjgdi3.apps.googleusercontent.com
```

**⚠️ Important:** Replace `https://your-backend-url.onrender.com` with your actual Render backend URL!

---

## ✅ After Adding Variables

1. **Go to Deployments tab**
2. **Click "Redeploy"** on the latest deployment
3. **Or push a new commit** to trigger auto-deploy

---

## 🔍 Where These Are Used

- **`VITE_API_BASE_URL`**: Used in `src/api/axiosConfig.jsx` for all API calls
- **`VITE_GOOGLE_CLIENT_ID`**: Used in `src/main.jsx` for Google OAuth provider

---

**That's it! Just 2 environment variables needed for Vercel!**

