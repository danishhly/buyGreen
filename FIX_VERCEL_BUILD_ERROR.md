# Fix Vercel Build Error: "vite: command not found"

## ❌ Problem

The build is failing because:
1. Vercel is trying to run `vite build` from `buygreen-fe/` directory
2. But your React app is actually in `buygreen-fe/buygreen/`
3. Dependencies need to be installed in the `buygreen` subdirectory

## ✅ Solution: Configure Build Settings

### Option 1: Update Vercel Build Settings (Recommended)

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Go to Settings → General**
4. **Scroll to "Build & Development Settings"**
5. **Update these fields:**

   **Root Directory:** `buygreen-fe`
   
   **Build Command:** 
   ```
   cd buygreen && npm install && npm run build
   ```
   (Or just: `cd buygreen && npm run build` if install runs automatically)
   
   **Output Directory:** 
   ```
   buygreen/dist
   ```
   
   **Install Command:**
   ```
   cd buygreen && npm install
   ```

6. **Click "Save"**
7. **Redeploy**

### Option 2: Use Vercel's Override Settings

In your project settings, you can override:

```json
{
  "buildCommand": "cd buygreen && npm run build",
  "outputDirectory": "buygreen/dist",
  "installCommand": "cd buygreen && npm install"
}
```

### Option 3: Create `vercel.json` in Root

Create a `vercel.json` file in your repository root (`buyGreen/vercel.json`):

```json
{
  "buildCommand": "cd buygreen-fe/buygreen && npm install && npm run build",
  "outputDirectory": "buygreen-fe/buygreen/dist",
  "installCommand": "cd buygreen-fe/buygreen && npm install",
  "framework": "vite"
}
```

Then push to GitHub and Vercel will use these settings.

## 🎯 Quick Fix Steps

1. **Go to Vercel Dashboard** → Your Project → Settings
2. **Find "Build & Development Settings"**
3. **Update Build Command to:**
   ```
   cd buygreen && npm install && npm run build
   ```
4. **Update Output Directory to:**
   ```
   buygreen/dist
   ```
5. **Update Install Command to:**
   ```
   cd buygreen && npm install
   ```
6. **Save and Redeploy**

## 📋 Complete Configuration

**Root Directory:** `buygreen-fe`

**Build Command:**
```bash
cd buygreen && npm install && npm run build
```

**Output Directory:**
```
buygreen/dist
```

**Install Command:**
```bash
cd buygreen && npm install
```

**Framework:** Vite (or Other)

## ✅ After Fixing

1. Save the settings
2. Go to Deployments tab
3. Click "Redeploy" on the latest deployment
4. Or push a new commit to trigger auto-deploy

---

**The issue is that Vercel needs to run commands from the `buygreen` subdirectory!**

