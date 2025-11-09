# Deployment Guide: Vercel + Render + Railway MySQL

Complete step-by-step guide for deploying BuyGreen with your chosen platforms.

---

## 📋 Prerequisites

- [ ] GitHub account (recommended for easy deployment)
- [ ] Vercel account
- [ ] Render account
- [ ] Railway account
- [ ] All production API keys ready

---

## 🗄️ Step 1: Set Up Railway MySQL Database

### 1.1 Create Railway Account
1. Go to https://railway.app
2. Sign up (use GitHub - easiest)
3. Verify your email

### 1.2 Create MySQL Database
1. Click **"New Project"**
2. Click **"New"** → **"Database"** → **"Add MySQL"**
3. Railway will automatically:
   - Create a MySQL database
   - Generate credentials
   - Provide connection details

### 1.3 Get Connection Details
1. Click on your MySQL service
2. Go to **"Variables"** tab
3. You'll see:
   - `MYSQLDATABASE` - Database name
   - `MYSQLUSER` - Username
   - `MYSQLPASSWORD` - Password
   - `MYSQLHOST` - Host
   - `MYSQLPORT` - Port (usually 3306)

### 1.4 Format Connection String for Render

**Option 1: Using Individual Variables (Recommended)**
In Render, set these environment variables:
```
DB_URL=jdbc:mysql://MYSQLHOST:MYSQLPORT/MYSQLDATABASE
DB_USERNAME=MYSQLUSER
DB_PASSWORD=MYSQLPASSWORD
```

**Option 2: Using Connection URL**
Railway also provides a `DATABASE_URL` in the format:
```
mysql://user:password@host:port/database
```

Convert to JDBC format:
```
DB_URL=jdbc:mysql://host:port/database
```

**Example:**
```
DB_URL=jdbc:mysql://containers-us-west-123.railway.app:3306/railway
DB_USERNAME=root
DB_PASSWORD=your_railway_password
```

### 1.5 Create Database Schema
Railway MySQL will auto-create tables when your app runs, but you can also:

1. Go to Railway MySQL service
2. Click **"Connect"** tab
3. Use **"MySQL Client"** or **"TablePlus"** to connect
4. Or let Spring Boot create tables automatically with `JPA_DDL_AUTO=update`

---

## 🚀 Step 2: Deploy Backend to Render

### 2.1 Prepare Your Code
1. **Push to GitHub** (recommended):
   ```powershell
   # In your project root
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/buygreen.git
   git push -u origin main
   ```

2. **Or prepare files for manual upload**

### 2.2 Create Render Web Service
1. Go to https://render.com
2. Sign up / Login
3. Click **"New +"** → **"Web Service"**
4. **Connect GitHub** (recommended) or upload files
5. Select your repository

### 2.3 Configure Render Service

**Basic Settings:**
- **Name:** `buygreen-backend`
- **Environment:** `Docker` or `Maven`
- **Region:** Choose closest to Railway region
- **Branch:** `main`

**Build Settings:**
- **Build Command:** `./mvnw clean package -DskipTests`
- **Start Command:** `java -jar target/buygreen-0.0.1-SNAPSHOT.jar`

**OR if using Docker:**
- **Dockerfile:** (Render will auto-detect)

### 2.4 Set Environment Variables in Render

Click **"Environment"** tab and add:

```
# Database (from Railway MySQL)
DB_URL=jdbc:mysql://your-railway-host:3306/railway
DB_USERNAME=root
DB_PASSWORD=your-railway-password

# JPA Configuration
JPA_DDL_AUTO=update
JPA_SHOW_SQL=false

# JWT
JWT_SECRET=your-strong-random-secret-here

# Razorpay (Production Keys)
RAZORPAY_KEY_ID=your_production_key_id
RAZORPAY_KEY_SECRET=your_production_key_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_email_app_password

# Frontend URL (will update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app

# Java Version (if needed)
JAVA_VERSION=21
```

**Important Notes:**
- Use Railway MySQL credentials
- Use production API keys, not test keys
- Generate a strong JWT secret
- Update `FRONTEND_URL` after Vercel deployment

### 2.5 Deploy
1. Click **"Create Web Service"**
2. Render will:
   - Build your application
   - Deploy it
   - Provide a URL (e.g., `https://buygreen-backend.onrender.com`)

### 2.6 Get Backend URL
1. Wait for deployment to complete
2. Copy your service URL (e.g., `https://buygreen-backend.onrender.com`)
3. **Save this** - you'll need it for Vercel

**Note:** Free tier on Render spins down after inactivity. Consider upgrading for production.

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend
1. **Create `.env.production`** in `buygreen-fe/buygreen/`:
   ```env
   VITE_API_BASE_URL=https://buygreen-backend.onrender.com
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_RAZORPAY_KEY_ID=your_production_razorpay_key_id
   ```

2. **Commit to GitHub** (if not already done)

### 3.2 Create Vercel Project
1. Go to https://vercel.com
2. Sign up / Login (use GitHub)
3. Click **"Add New..."** → **"Project"**
4. **Import** your GitHub repository
5. Select the repository

### 3.3 Configure Vercel Project

**Project Settings:**
- **Framework Preset:** Vite
- **Root Directory:** `buygreen-fe/buygreen`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3.4 Set Environment Variables in Vercel

Go to **Settings** → **Environment Variables** and add:

```
VITE_API_BASE_URL=https://buygreen-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_RAZORPAY_KEY_ID=your_production_razorpay_key_id
```

**Important:**
- Select **"Production"** environment
- Also add to **"Preview"** if you want staging

### 3.5 Deploy
1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Build your app
   - Deploy it
   - Provide a URL (e.g., `https://buygreen.vercel.app`)

### 3.6 Get Frontend URL
1. Wait for deployment
2. Copy your Vercel URL
3. **Save this**

---

## 🔄 Step 4: Update URLs (Important!)

### 4.1 Update Backend CORS

1. Go back to **Render** → Your backend service
2. Go to **Environment** tab
3. Update:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
4. Click **"Save Changes"**
5. Render will automatically redeploy

### 4.2 Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Go to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client
4. Add to **Authorized redirect URIs**:
   - `https://your-app.vercel.app`
   - `https://buygreen-backend.onrender.com/auth/google`
5. Save

### 4.3 Update Razorpay (if needed)

1. Go to Razorpay Dashboard
2. Update webhook URLs if using webhooks
3. Verify production keys are active

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Backend
```bash
# Test backend health
curl https://buygreen-backend.onrender.com

# Test login endpoint
curl -X POST https://buygreen-backend.onrender.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 5.2 Test Frontend
1. Visit your Vercel URL
2. Test:
   - [ ] Page loads
   - [ ] Login works
   - [ ] Products load
   - [ ] Cart works
   - [ ] Checkout works
   - [ ] Order placement works

### 5.3 Test Database Connection
1. Check Render logs for database connection
2. Try creating a user account
3. Verify data is saved in Railway MySQL
4. Check Railway MySQL dashboard for data

---

## 🔒 Step 6: Set Up Custom Domain (Optional)

### 6.1 Vercel Custom Domain
1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `buygreen.com`)
3. Follow DNS configuration instructions
4. Vercel provides free SSL

### 6.2 Render Custom Domain
1. Go to Render service → **Settings** → **Custom Domains**
2. Add your domain (e.g., `api.buygreen.com`)
3. Configure DNS
4. Render provides free SSL

### 6.3 Update Environment Variables
After setting up custom domains, update:
- Backend: `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS`
- Frontend: `VITE_API_BASE_URL`
- Google OAuth redirect URIs

---

## 📊 Step 7: Monitoring & Maintenance

### 7.1 Render Monitoring
- **Logs:** Available in Render dashboard
- **Metrics:** Basic metrics on free tier
- **Alerts:** Set up email alerts for downtime

### 7.2 Vercel Analytics
- **Analytics:** Enable in Vercel dashboard
- **Speed Insights:** Available on paid plans
- **Logs:** Available in dashboard

### 7.3 Railway MySQL Monitoring
- **Metrics:** Available in Railway dashboard
- **Logs:** View database logs
- **Usage:** Monitor storage and connections

---

## 🚨 Troubleshooting

### Backend Won't Start on Render
**Issue:** Build fails or app crashes
**Solutions:**
- Check Render logs
- Verify Java version (needs 21)
- Check environment variables
- Verify database connection string
- Check Railway MySQL is running

### Frontend Can't Connect to Backend
**Issue:** CORS errors or connection refused
**Solutions:**
- Verify `VITE_API_BASE_URL` in Vercel
- Check `CORS_ALLOWED_ORIGINS` in Render
- Verify backend is running (not sleeping)
- Check browser console for errors

### Database Connection Fails
**Issue:** Can't connect to Railway MySQL
**Solutions:**
- Verify connection string format
- Check credentials in Railway
- Verify database name matches
- Check Railway MySQL service is running
- Verify port is 3306
- Check firewall/network settings

### Render Service Sleeping
**Issue:** Free tier spins down after inactivity
**Solutions:**
- First request after sleep takes ~30 seconds
- Consider upgrading to paid plan
- Use uptime monitoring to keep it awake
- Or accept the cold start delay

### Railway MySQL Connection Issues
**Issue:** Connection timeout or refused
**Solutions:**
- Verify MySQL service is running in Railway
- Check connection string format
- Verify credentials
- Check if database exists
- Review Railway logs

---

## 💰 Cost Estimate

### Free Tier (Good for Testing)
- **Vercel:** Free (generous limits)
- **Render:** Free (with limitations)
- **Railway:** Free ($5 credit/month)

### Paid Tier (Production)
- **Vercel:** ~$20/month (Pro plan)
- **Render:** ~$7/month (Starter plan)
- **Railway:** ~$5-20/month (depending on usage)

**Total:** ~$32-47/month for production setup

---

## 📝 Quick Reference

### Important URLs
- **Backend:** `https://buygreen-backend.onrender.com`
- **Frontend:** `https://your-app.vercel.app`
- **Database:** Railway MySQL dashboard

### Environment Variables Checklist
- [ ] Database connection (Railway MySQL)
- [ ] JWT secret
- [ ] Razorpay production keys
- [ ] Google OAuth client ID
- [ ] Email credentials
- [ ] Frontend URL (in backend)
- [ ] Backend URL (in frontend)

---

## 🎉 You're Live!

Your application is now deployed on:
- ✅ **Frontend:** Vercel
- ✅ **Backend:** Render
- ✅ **Database:** Railway MySQL

**Next Steps:**
1. Test all features thoroughly
2. Set up monitoring
3. Configure custom domain (optional)
4. Set up backups
5. Share with users!

**Need help?** Check platform documentation or ask for assistance.

