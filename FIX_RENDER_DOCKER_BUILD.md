# Fix Render Docker Build Error

## ❌ Error You're Seeing

```
error: failed to solve: failed to compute cache key: failed to calculate checksum of ref: "/src": not found
```

## 🔍 Problem

Render is trying to build from the **repository root**, but your Dockerfile expects files in the `buygreen/` subdirectory.

## ✅ Solution: Set Root Directory in Render

### Step 1: Go to Render Service Settings

1. In Render dashboard, go to your web service
2. Click **"Settings"** tab
3. Scroll down to **"Build & Deploy"** section

### Step 2: Set Root Directory

1. Find **"Root Directory"** field
2. Enter: `buygreen`
3. Click **"Save Changes"**

### Step 3: Redeploy

1. Render will automatically redeploy
2. Or manually trigger a deploy

## 🔧 Alternative: If Root Directory Option Not Available

If you can't set Root Directory, we need to adjust the Dockerfile path. But first, try setting Root Directory - that's the correct solution.

## 📋 Verify Your Setup

Make sure in Render:
- ✅ **Root Directory:** `buygreen`
- ✅ **Dockerfile Path:** (empty or auto-detect)
- ✅ **Language:** Docker

## 🎯 What This Does

Setting Root Directory to `buygreen` tells Render:
- Use `buygreen/` as the base directory for the build
- Find `Dockerfile` in `buygreen/Dockerfile`
- All COPY commands in Dockerfile will work relative to `buygreen/`

---

**After setting Root Directory to `buygreen`, the build should work!**

