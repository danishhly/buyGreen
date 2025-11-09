# Deployment Guide - Step by Step

## 🎯 Overview

This guide will walk you through deploying your BuyGreen application to production.

## 📋 Pre-Deployment Checklist

Before starting, ensure:
- [ ] All features tested and working
- [ ] No critical bugs
- [ ] Production environment variables ready
- [ ] Production database set up
- [ ] Domain/hosting ready
- [ ] SSL certificate ready (for HTTPS)

---

## 🚀 Step 1: Choose Your Deployment Platform

### Option A: Traditional VPS/Server (DigitalOcean, AWS EC2, etc.)
- Full control
- Requires server management
- More setup required

### Option B: Platform as a Service (Heroku, Railway, Render)
- Easier setup
- Less control
- Built-in features

### Option C: Container Platform (Docker + Cloud)
- Scalable
- Modern approach
- More complex

**Recommended for beginners:** Railway, Render, or Heroku

---

## 🔧 Step 2: Prepare Backend for Production

### 2.1 Build Production JAR

```powershell
cd U:\buyGreen\buygreen
.\mvnw.cmd clean package -DskipTests
```

This creates: `target/buygreen-0.0.1-SNAPSHOT.jar`

### 2.2 Prepare Environment Variables

Create a list of all production environment variables:

**Required Variables:**
```
DB_URL=jdbc:mysql://your-production-db-host:3306/buygreen_db
DB_USERNAME=your_production_db_user
DB_PASSWORD=your_secure_db_password
JWT_SECRET=your_strong_random_secret
RAZORPAY_KEY_ID=your_production_razorpay_key
RAZORPAY_KEY_SECRET=your_production_razorpay_secret
GOOGLE_CLIENT_ID=your_google_client_id
MAIL_USERNAME=your_production_email
MAIL_PASSWORD=your_email_app_password
FRONTEND_URL=https://yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
JPA_DDL_AUTO=validate
```

**Generate JWT Secret:**
```powershell
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 2.3 Update Database Configuration

For production, set:
- `JPA_DDL_AUTO=validate` (or `none`)
- Use production database credentials
- Ensure database is accessible from your server

---

## 🌐 Step 3: Prepare Frontend for Production

### 3.1 Create Production Environment File

Create `.env.production` in `buygreen-fe/buygreen/`:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_RAZORPAY_KEY_ID=your_production_razorpay_key_id
```

### 3.2 Build Frontend

```powershell
cd U:\buyGreen\buygreen-fe\buygreen
npm run build
```

This creates: `dist/` folder with production-ready files

---

## 📦 Step 4: Deploy Backend

### Option A: Deploy to Railway

1. **Sign up** at https://railway.app
2. **Create New Project**
3. **Add Service** → **Empty Service**
4. **Upload JAR file** or connect GitHub repo
5. **Set Environment Variables** in Railway dashboard
6. **Deploy**

Railway will:
- Automatically detect Java
- Run your JAR file
- Provide a public URL

### Option B: Deploy to Render

1. **Sign up** at https://render.com
2. **New** → **Web Service**
3. **Connect GitHub** (or upload files)
4. **Build Command:** `mvn clean package -DskipTests`
5. **Start Command:** `java -jar target/buygreen-0.0.1-SNAPSHOT.jar`
6. **Set Environment Variables**
7. **Deploy**

### Option C: Deploy to VPS/Server

1. **Upload JAR file** to server (using SCP, FTP, etc.)
2. **SSH into server**
3. **Install Java 21** (if not installed)
4. **Set environment variables** (in `.env` file or system)
5. **Run application:**

```bash
# Create startup script
nano start.sh

# Add:
#!/bin/bash
export DB_URL=...
export DB_USERNAME=...
# ... all other variables
java -jar buygreen-0.0.1-SNAPSHOT.jar

# Make executable
chmod +x start.sh

# Run
./start.sh
```

6. **Use process manager** (PM2, systemd) to keep it running:

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start buygreen-0.0.1-SNAPSHOT.jar --name buygreen-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

---

## 🎨 Step 5: Deploy Frontend

### Option A: Deploy to Vercel

1. **Sign up** at https://vercel.com
2. **Import Project** → Connect GitHub or upload
3. **Root Directory:** `buygreen-fe/buygreen`
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Set Environment Variables**
7. **Deploy**

### Option B: Deploy to Netlify

1. **Sign up** at https://netlify.com
2. **Add New Site** → **Deploy manually**
3. **Drag and drop** `dist/` folder
4. **Or connect GitHub** and set:
   - Base directory: `buygreen-fe/buygreen`
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Set Environment Variables**
6. **Deploy**

### Option C: Deploy to Traditional Web Server

1. **Upload `dist/` folder** to web server
2. **Configure web server** (Nginx, Apache)
3. **Set up SSL** (Let's Encrypt)
4. **Configure routing** for SPA

**Nginx Configuration Example:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /var/www/buygreen/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔒 Step 6: Configure Domain & SSL

### 6.1 Point Domain to Your Servers

**Backend:**
- Point `api.yourdomain.com` to backend server IP
- Or use platform-provided domain

**Frontend:**
- Point `yourdomain.com` to frontend server IP
- Or use platform-provided domain

### 6.2 Set Up SSL (HTTPS)

**Using Let's Encrypt (Free):**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

**Or use platform SSL:**
- Most platforms (Vercel, Netlify, Railway) provide free SSL
- Enable in platform dashboard

---

## ✅ Step 7: Post-Deployment Verification

### 7.1 Test Backend

```bash
# Test health endpoint
curl https://api.yourdomain.com

# Test login
curl -X POST https://api.yourdomain.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 7.2 Test Frontend

1. Visit your frontend URL
2. Test login
3. Test product browsing
4. Test checkout
5. Test order placement

### 7.3 Verify Environment Variables

- [ ] Database connection works
- [ ] Email sending works
- [ ] Payment gateway configured
- [ ] CORS allows frontend domain
- [ ] Google OAuth redirects to production URL

---

## 🔧 Step 8: Set Up Monitoring

### 8.1 Error Tracking

**Option A: Sentry**
1. Sign up at https://sentry.io
2. Add to your application
3. Monitor errors

**Option B: Logging Service**
- Use platform logging (Railway, Render provide this)
- Set up log aggregation

### 8.2 Uptime Monitoring

**Services:**
- UptimeRobot (free)
- Pingdom
- StatusCake

---

## 📊 Step 9: Database Backup Strategy

### 9.1 Set Up Automated Backups

**For MySQL:**
```bash
# Create backup script
#!/bin/bash
mysqldump -u user -p buygreen_db > backup_$(date +%Y%m%d).sql

# Schedule with cron
0 2 * * * /path/to/backup.sh
```

**Or use platform backups:**
- Most database services provide automated backups
- Enable in your database provider dashboard

---

## 🚨 Step 10: Security Checklist

- [ ] All environment variables set
- [ ] HTTPS enabled
- [ ] Database credentials secure
- [ ] API keys are production keys (not test keys)
- [ ] CORS configured for production domain only
- [ ] JWT secret is strong and unique
- [ ] Error messages don't expose sensitive info
- [ ] Rate limiting configured (if needed)

---

## 📝 Quick Deployment Commands

### Backend
```powershell
# Build
cd buygreen
.\mvnw.cmd clean package -DskipTests

# Upload JAR to server
# Set environment variables
# Run: java -jar buygreen-0.0.1-SNAPSHOT.jar
```

### Frontend
```powershell
# Build
cd buygreen-fe/buygreen
npm run build

# Upload dist/ folder to web server
# Or deploy via platform
```

---

## 🆘 Troubleshooting

### Backend won't start
- Check Java version (needs Java 21)
- Verify environment variables
- Check database connection
- Review logs

### Frontend can't connect to backend
- Verify CORS configuration
- Check API URL in frontend
- Verify backend is running
- Check network/firewall settings

### Database connection fails
- Verify database is accessible
- Check credentials
- Verify database exists
- Check firewall rules

---

## 📚 Additional Resources

- **Railway Docs:** https://docs.railway.app
- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Let's Encrypt:** https://letsencrypt.org

---

## 🎉 You're Live!

Once deployed:
1. Test all critical features
2. Monitor for errors
3. Set up backups
4. Share with users!

**Need help?** Check platform documentation or ask for assistance.

