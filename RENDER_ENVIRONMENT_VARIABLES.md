# Render Environment Variables - Complete List

## 🔑 Required Environment Variables for Render

Add these environment variables in Render's "Environment Variables" section:

### 1. Database Configuration (Railway MySQL)

**NAME:** `DB_URL`  
**VALUE:** `jdbc:mysql://your-railway-host:3306/railway`  
**Example:** `jdbc:mysql://containers-us-west-123.railway.app:3306/railway`

**NAME:** `DB_USERNAME`  
**VALUE:** Your Railway MySQL username (usually `root`)

**NAME:** `DB_PASSWORD`  
**VALUE:** Your Railway MySQL password (from Railway Variables)

---

### 2. JPA Configuration

**NAME:** `JPA_DDL_AUTO`  
**VALUE:** `update`  
*(Use `validate` for production after initial setup)*

**NAME:** `JPA_SHOW_SQL`  
**VALUE:** `false`

---

### 3. JWT Secret

**NAME:** `JWT_SECRET`  
**VALUE:** A strong random secret (at least 256 bits)  
**Generate with PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```
**Or use:** Any long random string (64+ characters)

---

### 4. Razorpay Configuration (Production Keys)

**NAME:** `RAZORPAY_KEY_ID`  
**VALUE:** Your production Razorpay Key ID  
**Example:** `rzp_live_xxxxxxxxxxxxx`

**NAME:** `RAZORPAY_KEY_SECRET`  
**VALUE:** Your production Razorpay Key Secret  
**Example:** `your_production_secret_key`

---

### 5. Google OAuth

**NAME:** `GOOGLE_CLIENT_ID`  
**VALUE:** Your Google OAuth Client ID  
**Example:** `189236141996-xxxxxxxxxxxxx.apps.googleusercontent.com`

---

### 6. Email Configuration

**NAME:** `MAIL_HOST`  
**VALUE:** `smtp.gmail.com`

**NAME:** `MAIL_PORT`  
**VALUE:** `587`

**NAME:** `MAIL_USERNAME`  
**VALUE:** Your email address  
**Example:** `your-email@gmail.com`

**NAME:** `MAIL_PASSWORD`  
**VALUE:** Your email app password (Gmail App Password)  
**Note:** Not your regular Gmail password - use App Password

---

### 7. Frontend URL (Update after Vercel deployment)

**NAME:** `FRONTEND_URL`  
**VALUE:** Your Vercel frontend URL  
**Example:** `https://your-app.vercel.app`  
**Note:** Update this after deploying frontend to Vercel

**NAME:** `CORS_ALLOWED_ORIGINS`  
**VALUE:** Your Vercel frontend URL (same as above)  
**Example:** `https://your-app.vercel.app`  
**Note:** Update this after deploying frontend to Vercel

---

## 📋 Quick Copy-Paste List

Add these one by one in Render:

```
DB_URL=jdbc:mysql://your-railway-host:3306/railway
DB_USERNAME=root
DB_PASSWORD=your_railway_password
JPA_DDL_AUTO=update
JPA_SHOW_SQL=false
JWT_SECRET=your_strong_random_secret_here
RAZORPAY_KEY_ID=your_production_razorpay_key_id
RAZORPAY_KEY_SECRET=your_production_razorpay_secret
GOOGLE_CLIENT_ID=your_google_client_id
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_email_app_password
FRONTEND_URL=https://your-app.vercel.app
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

---

## ⚠️ Important Notes

1. **Get Railway MySQL credentials:**
   - Go to Railway → Your MySQL service → Variables tab
   - Copy `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`

2. **Update Frontend URLs later:**
   - After deploying to Vercel, update `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS`
   - Render will automatically redeploy when you save

3. **Use production keys:**
   - Don't use test keys for Razorpay
   - Use production Google OAuth client ID

4. **Email App Password:**
   - For Gmail, create an App Password (not regular password)
   - Go to Google Account → Security → App Passwords

---

## 🔒 Security Tips

- ✅ Never commit these values to GitHub
- ✅ Use Render's environment variables (secure)
- ✅ Regenerate secrets if compromised
- ✅ Use different values for production vs development

---

## ✅ Checklist

- [ ] Database credentials from Railway
- [ ] JWT secret generated
- [ ] Razorpay production keys
- [ ] Google OAuth client ID
- [ ] Email credentials
- [ ] Frontend URL (update after Vercel)
- [ ] CORS allowed origins (update after Vercel)

