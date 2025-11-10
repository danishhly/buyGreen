# How to Set Environment Variables in Render and Railway

## 🔒 Security First: Protect Your Credentials

### ✅ Your .gitignore Already Protects .env Files

Your `.gitignore` already includes:
- `.env`
- `.env.local`
- `.env.production`

**This means your .env file won't be committed to GitHub!** ✅

### 📝 Create .env.example (Template Without Secrets)

Create a `.env.example` file in `buygreen/` folder as a template:

```env
# Database Configuration (from Railway)
MYSQLHOST=your-railway-host
MYSQLPORT=3306
MYSQLDATABASE=railway
MYSQLUSER=root
MYSQLPASSWORD=your-password

# Razorpay Configuration
RAZORPAY_KEYID=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret

# Google OAuth
GOOGLE_CLIENTID=your_google_client_id

# JWT Secret
JWT_SECRET=your_jwt_secret

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**This file CAN be committed** - it's just a template with no real secrets.

---

## 🚂 Step 1: Get Values from Railway MySQL

### In Railway Dashboard:

1. **Go to Railway** → Your MySQL service
2. **Click "Variables" tab** (you're already there!)
3. **Copy these values:**
   - `MYSQLHOST` → Copy the value (e.g., `interchange.proxy.rlwy.net`)
   - `MYSQLPORT` → Copy the value (e.g., `55721`)
   - `MYSQLDATABASE` → Copy the value (usually `railway`)
   - `MYSQLUSER` → Copy the value (usually `root`)
   - `MYSQLPASSWORD` → Click to reveal, then copy

**Note:** Railway shows these values masked (`*******`). Click the eye icon or three dots to reveal.

---

## 🎨 Step 2: Set Environment Variables in Render

### In Render Dashboard:

1. **Go to Render** → Your backend service
2. **Click "Environment" tab** (or "Settings" → "Environment")
3. **Click "Add Environment Variable"** button
4. **Add each variable one by one:**

#### Database Variables (from Railway):
- **Name:** `MYSQLHOST`  
  **Value:** `interchange.proxy.rlwy.net` (from Railway)

- **Name:** `MYSQLPORT`  
  **Value:** `55721` (from Railway)

- **Name:** `MYSQLDATABASE`  
  **Value:** `railway` (from Railway)

- **Name:** `MYSQLUSER`  
  **Value:** `root` (from Railway)

- **Name:** `MYSQLPASSWORD`  
  **Value:** `ZCuqTUpUkMmrjtGSTzayNrWMAXZUTICt` (from Railway)

#### Email Variables:
- **Name:** `MAIL_HOST`  
  **Value:** `smtp.gmail.com`

- **Name:** `MAIL_PORT`  
  **Value:** `587`

- **Name:** `MAIL_USERNAME`  
  **Value:** `dnsh.1inn@gmail.com`

- **Name:** `MAIL_PASSWORD`  
  **Value:** `curn acmo ysdz yegj` (your Gmail App Password)

#### Other Variables:
- **Name:** `JWT_SECRET`  
  **Value:** `0886c172ca70630c7a458eb61aa7fc92b13e3e5dd9d2cea5baf4e8e0b43ced129688c897`

- **Name:** `RAZORPAY_KEYID`  
  **Value:** `rzp_test_RdimoEoYcYRvFQ`

- **Name:** `RAZORPAY_SECRET`  
  **Value:** `XAz0a63Em2tDfPeKejH34L0s`

- **Name:** `GOOGLE_CLIENTID`  
  **Value:** `189236141996-658di7k0m2fuf4taqpn45uep5ivjgdi3.apps.googleusercontent.com`

- **Name:** `FRONTEND_URL`  
  **Value:** `https://your-app.vercel.app` (update after Vercel deployment)

- **Name:** `CORS_ALLOWED_ORIGINS`  
  **Value:** `https://your-app.vercel.app` (same as FRONTEND_URL)

5. **Click "Save Changes"** after adding all variables
6. **Render will automatically redeploy**

---

## 📋 Complete List for Render

Copy-paste this list and fill in the values:

```
MYSQLHOST=interchange.proxy.rlwy.net
MYSQLPORT=55721
MYSQLDATABASE=railway
MYSQLUSER=root
MYSQLPASSWORD=ZCuqTUpUkMmrjtGSTzayNrWMAXZUTICt
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=dnsh.1inn@gmail.com
MAIL_PASSWORD=curn acmo ysdz yegj
JWT_SECRET=0886c172ca70630c7a458eb61aa7fc92b13e3e5dd9d2cea5baf4e8e0b43ced129688c897
RAZORPAY_KEYID=rzp_test_RdimoEoYcYRvFQ
RAZORPAY_SECRET=XAz0a63Em2tDfPeKejH34L0s
GOOGLE_CLIENTID=189236141996-658di7k0m2fuf4taqpn45uep5ivjgdi3.apps.googleusercontent.com
FRONTEND_URL=https://your-app.vercel.app
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

---

## 🔧 Fix Your .env File

Your `.env` file has some Spring Boot properties that shouldn't be there. Here's the corrected version:

### Create/Update `buygreen/.env`:

```env
# Database Configuration (from Railway)
MYSQLHOST=interchange.proxy.rlwy.net
MYSQLPORT=55721
MYSQLDATABASE=railway
MYSQLUSER=root
MYSQLPASSWORD=ZCuqTUpUkMmrjtGSTzayNrWMAXZUTICt

# Razorpay Configuration
RAZORPAY_KEYID=rzp_test_RdimoEoYcYRvFQ
RAZORPAY_SECRET=XAz0a63Em2tDfPeKejH34L0s

# Google OAuth Configuration
GOOGLE_CLIENTID=189236141996-658di7k0m2fuf4taqpn45uep5ivjgdi3.apps.googleusercontent.com

# JWT Configuration
JWT_SECRET=0886c172ca70630c7a458eb61aa7fc92b13e3e5dd9d2cea5baf4e8e0b43ced129688c897

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=dnsh.1inn@gmail.com
MAIL_PASSWORD=curn acmo ysdz yegj

# Frontend URL Configuration
FRONTEND_URL=http://localhost:5173
```

**Remove these from .env** (they belong in application.properties):
- ❌ `spring.jpa.hibernate.ddl-auto=update`
- ❌ `spring.jpa.show-sql=false`
- ❌ `spring.jpa.properties.hibernate.dialect=...`
- ❌ `spring.mail.host=...`
- ❌ `spring.mail.port=...`
- ❌ `spring.mail.properties.mail.smtp.auth=...`
- ❌ `spring.mail.properties.mail.smtp.starttls.enable=...`

---

## ✅ Verify .gitignore

Make sure your `.gitignore` includes:

```gitignore
# Environment variables
.env
.env.local
.env.production
.env.development
```

**Your .gitignore already has this!** ✅

---

## 🎯 Quick Steps Summary

### For Render:
1. Go to Render → Your service → Environment tab
2. Click "Add Environment Variable"
3. Add all variables from the list above
4. Save → Auto-redeploys

### For Railway:
- Variables are already set automatically
- Just copy the values to use in Render

### For Local Development:
- Use `.env` file (already in .gitignore)
- Don't commit `.env` to GitHub
- Create `.env.example` as template

---

## 🔒 Security Checklist

- [x] `.env` is in `.gitignore` ✅
- [ ] `.env.example` created (template without secrets)
- [ ] All variables set in Render
- [ ] No hardcoded secrets in code
- [ ] No secrets in application.properties
- [ ] Railway variables secured (already done)

---

**Your setup is secure! Just add the variables to Render and you're good to go!**

