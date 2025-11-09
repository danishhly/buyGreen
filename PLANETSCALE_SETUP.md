# PlanetScale Database Setup Guide

## 🚀 Quick Setup

### Step 1: Create Account
1. Go to https://planetscale.com
2. Click **"Sign up"**
3. Use GitHub to sign up (easiest)
4. Verify email

### Step 2: Create Database
1. Click **"Create database"**
2. **Name:** `buygreen_db`
3. **Region:** Choose closest to your users (e.g., `us-east-1`)
4. **Plan:** Free (good for testing)
5. Click **"Create database"**

### Step 3: Get Connection String
1. In your database dashboard, click **"Connect"**
2. Select **"General"** tab
3. Copy the connection string:
   ```
   mysql://username:password@host:port/database?sslMode=REQUIRED
   ```

### Step 4: Extract Credentials
From the connection string, extract:
- **Host:** `aws.connect.psdb.cloud` (example)
- **Port:** `3306`
- **Username:** From connection string
- **Password:** From connection string
- **Database:** `buygreen_db`

### Step 5: Format for Render
Use this format in Render environment variables:

```
DB_URL=jdbc:mysql://host:port/database?sslMode=REQUIRED
DB_USERNAME=username
DB_PASSWORD=password
```

**Example:**
```
DB_URL=jdbc:mysql://aws.connect.psdb.cloud:3306/buygreen_db?sslMode=REQUIRED
DB_USERNAME=abc123xyz
DB_PASSWORD=pscale_pw_xyz789
```

## ⚠️ Important Notes

1. **SSL Required:** PlanetScale requires SSL, so always include `?sslMode=REQUIRED`

2. **Branch System:** PlanetScale uses branches for schema changes
   - `main` branch = production
   - Create branches for schema changes
   - Merge branches when ready

3. **Connection Limits:** Free tier has connection limits
   - Monitor connections in dashboard
   - Use connection pooling if needed

4. **Password:** PlanetScale generates passwords
   - Save password securely
   - Can regenerate if needed

## 🔧 Schema Management

### Auto-Create (Recommended)
Your Spring Boot app will auto-create tables when it starts with:
```
JPA_DDL_AUTO=update
```

### Manual Schema (Alternative)
1. Go to database → **"Branches"** → **"main"**
2. Click **"Console"**
3. Run SQL commands:
   ```sql
   CREATE TABLE IF NOT EXISTS customers (...);
   -- etc.
   ```

## 📊 Monitoring

1. **Dashboard:** View metrics in PlanetScale dashboard
2. **Queries:** See query performance
3. **Connections:** Monitor active connections
4. **Storage:** Check database size

## 🔒 Security

- ✅ SSL/TLS encryption (automatic)
- ✅ Password authentication
- ✅ IP allowlisting (optional, paid plans)
- ✅ Branch-based schema changes

## 💡 Tips

1. **Free Tier Limits:**
   - 5GB storage
   - 1 billion rows
   - 1 database
   - Good for testing/small apps

2. **Upgrade When:**
   - Need more storage
   - Need more databases
   - Need better performance
   - Need advanced features

3. **Backups:**
   - Automatic on paid plans
   - Manual export available
   - Point-in-time recovery (paid)

## 🆘 Troubleshooting

### Connection Timeout
- Check firewall settings
- Verify connection string
- Check SSL mode

### Authentication Failed
- Verify username/password
- Check if password was regenerated
- Verify database name

### SSL Error
- Ensure `?sslMode=REQUIRED` is in connection string
- Check Java SSL configuration

---

**That's it!** Your PlanetScale database is ready to use.

