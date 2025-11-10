# Fix: Case Sensitivity Issue - Api vs api

## ❌ Problem

The error shows:
```
Could not load /vercel/path0/buygreen-fe/buygreen/src/api/axiosConfig.jsx
ENOENT: no such file or directory
```

But git shows the file is at:
```
buygreen-fe/buygreen/src/Api/axiosConfig.jsx  (capital A)
```

## ✅ Root Cause

- **Windows** (your local machine): Case-insensitive file system
  - `src/api/` and `src/Api/` are the same
  - Everything works locally

- **Linux** (Vercel build server): Case-sensitive file system
  - `src/api/` and `src/Api/` are different directories
  - Build fails because it can't find `src/api/axiosConfig.jsx`

## ✅ Solution Applied

1. **Removed old case from git:**
   ```powershell
   git rm -r --cached buygreen-fe/buygreen/src/Api
   ```

2. **Added correct case:**
   ```powershell
   git add buygreen-fe/buygreen/src/api/
   ```

3. **Commit and push:**
   ```powershell
   git commit -m "Fix case sensitivity: rename Api to api directory"
   git push
   ```

## 📋 Next Steps

1. **Commit the changes:**
   ```powershell
   git add buygreen-fe/buygreen/src/api/
   git commit -m "Fix case sensitivity: rename Api to api directory"
   ```

2. **Push to GitHub:**
   ```powershell
   git push
   ```

3. **Vercel will auto-redeploy** with the correct case

## ✅ Expected Result

After pushing:
- ✅ Git will track `src/api/` (lowercase)
- ✅ Vercel build will find `src/api/axiosConfig.jsx`
- ✅ Build will succeed

---

**The case sensitivity fix is ready - commit and push!**

