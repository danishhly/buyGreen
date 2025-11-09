# Quick Deployment Checklist

## 🚀 Fastest Deployment Path

### 1. Backend → Railway (5 minutes)

1. Go to https://railway.app
2. Sign up / Login
3. New Project → Empty Service
4. Upload `target/buygreen-0.0.1-SNAPSHOT.jar`
5. Add Environment Variables (see below)
6. Deploy

**Environment Variables to Add:**
```
DB_URL=...
DB_USERNAME=...
DB_PASSWORD=...
JWT_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
GOOGLE_CLIENT_ID=...
MAIL_USERNAME=...
MAIL_PASSWORD=...
FRONTEND_URL=https://your-frontend-url
CORS_ALLOWED_ORIGINS=https://your-frontend-url
JPA_DDL_AUTO=validate
```

### 2. Frontend → Vercel (5 minutes)

1. Go to https://vercel.com
2. Sign up / Login
3. Add New Project
4. Import from GitHub (or upload)
5. Settings:
   - Root Directory: `buygreen-fe/buygreen`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variables:
   ```
   VITE_API_BASE_URL=https://your-backend-url
   VITE_GOOGLE_CLIENT_ID=...
   VITE_RAZORPAY_KEY_ID=...
   ```
7. Deploy

### 3. Database → Railway / PlanetScale / Supabase

**Option A: Railway Database**
- Railway → New → Database → MySQL
- Get connection string
- Use in backend environment variables

**Option B: PlanetScale (Free)**
- Sign up at https://planetscale.com
- Create database
- Get connection string

### 4. Update URLs

After deployment:
1. Get backend URL from Railway
2. Get frontend URL from Vercel
3. Update:
   - Backend: `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS`
   - Frontend: `VITE_API_BASE_URL`
4. Redeploy both

### 5. Test

1. Visit frontend URL
2. Test login
3. Test checkout
4. Verify everything works

---

## ✅ Done!

Your app is live! 🎉

---

## 📝 Pre-Deployment Checklist

Before deploying:
- [ ] Build backend JAR: `.\mvnw.cmd clean package -DskipTests`
- [ ] Build frontend: `npm run build`
- [ ] Prepare all environment variables
- [ ] Test locally one more time
- [ ] Have production database ready
- [ ] Have production API keys ready

---

## 🆘 Common Issues

**Backend 500 Error:**
- Check environment variables
- Check database connection
- Review logs

**Frontend Can't Connect:**
- Verify `VITE_API_BASE_URL`
- Check CORS settings
- Verify backend is running

**Database Connection Failed:**
- Check credentials
- Verify database exists
- Check firewall/network

---

**Total Time: ~15 minutes for basic deployment**

