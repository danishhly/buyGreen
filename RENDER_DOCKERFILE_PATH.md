# Render Dockerfile Path Configuration

## ✅ Correct Configuration

Since your Dockerfile is in the `buygreen/` subdirectory, configure Render as follows:

### Option 1: Set Root Directory (Recommended)

In Render's service configuration:

1. **Root Directory:** `buygreen`
   - This tells Render to use `buygreen/` as the base directory
   - Render will automatically find `Dockerfile` in that directory

2. **Dockerfile Path:** (Leave empty or auto-detect)
   - Render will find `Dockerfile` automatically in the root directory

### Option 2: Specify Dockerfile Path

If Root Directory option is not available:

1. **Root Directory:** (Leave as root `/`)
2. **Dockerfile Path:** `buygreen/Dockerfile`

## 📁 Your Repository Structure

```
your-repo/
├── buygreen/
│   ├── Dockerfile          ← Your Dockerfile is here
│   ├── pom.xml
│   ├── src/
│   └── ...
└── buygreen-fe/
    └── ...
```

## 🎯 Render Configuration Summary

**When creating/editing your Render service:**

- **Language:** Docker
- **Root Directory:** `buygreen` ✅
- **Dockerfile Path:** (auto-detected) or `buygreen/Dockerfile`
- **Branch:** `main`

## ⚠️ Important Notes

1. **Root Directory** is the key setting - set it to `buygreen`
2. Render will look for `Dockerfile` in that directory
3. All build commands will run from that directory
4. Make sure `buygreen/` contains:
   - `Dockerfile`
   - `pom.xml`
   - `mvnw` (Maven wrapper)
   - `.mvn/` directory
   - `src/` directory

## 🔍 How to Verify

After setting Root Directory to `buygreen`:
1. Render should detect the Dockerfile automatically
2. Check the build logs - it should show:
   ```
   Building Docker image...
   Using Dockerfile: buygreen/Dockerfile
   ```

---

**Summary: Set Root Directory to `buygreen` in Render!**

