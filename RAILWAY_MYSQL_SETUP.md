# Railway MySQL Database Setup Guide

## 🚀 Quick Setup

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign up with GitHub (easiest)
4. Verify email if needed

### Step 2: Create MySQL Database
1. In Railway dashboard, click **"New Project"**
2. Click **"New"** button
3. Select **"Database"** → **"Add MySQL"**
4. Railway will automatically:
   - Provision MySQL database
   - Generate credentials
   - Create connection variables

### Step 3: Get Connection Details
1. Click on your **MySQL** service in Railway
2. Go to **"Variables"** tab
3. You'll see these variables:
   - `MYSQLDATABASE` - Database name (usually `railway`)
   - `MYSQLUSER` - Username (usually `root`)
   - `MYSQLPASSWORD` - Auto-generated password
   - `MYSQLHOST` - Host address
   - `MYSQLPORT` - Port (usually `3306`)

### Step 4: Format for Render

**For Render Environment Variables, use:**

```
DB_URL=jdbc:mysql://MYSQLHOST:MYSQLPORT/MYSQLDATABASE
DB_USERNAME=MYSQLUSER
DB_PASSWORD=MYSQLPASSWORD
```

**Example:**
```
DB_URL=jdbc:mysql://containers-us-west-123.railway.app:3306/railway
DB_USERNAME=root
DB_PASSWORD=abc123xyz789
```

### Step 5: Alternative - Use DATABASE_URL

Railway also provides a `DATABASE_URL` in format:
```
mysql://user:password@host:port/database
```

**Convert to JDBC format:**
- Extract: `host`, `port`, `database`, `user`, `password`
- Format: `jdbc:mysql://host:port/database`

---

## 🔧 Database Configuration

### Auto-Create Tables (Recommended)
Your Spring Boot app will auto-create tables when it starts with:
```
JPA_DDL_AUTO=update
```

This is recommended for development.

### Production Setup
For production, use:
```
JPA_DDL_AUTO=validate
```

This validates schema without auto-creating tables.

---

## 📊 Accessing Your Database

### Option 1: Railway Dashboard
1. Go to MySQL service
2. Click **"Connect"** tab
3. Use **"MySQL Client"** or connect via external tool

### Option 2: External Tool (TablePlus, DBeaver, etc.)
1. Get connection details from Railway Variables
2. Use:
   - **Host:** `MYSQLHOST`
   - **Port:** `MYSQLPORT`
   - **Database:** `MYSQLDATABASE`
   - **Username:** `MYSQLUSER`
   - **Password:** `MYSQLPASSWORD`

### Option 3: Command Line
```bash
mysql -h MYSQLHOST -P MYSQLPORT -u MYSQLUSER -p MYSQLDATABASE
# Enter password when prompted
```

---

## 🔒 Security Notes

1. **Credentials:**
   - Railway auto-generates secure passwords
   - Don't share credentials
   - Can regenerate password if needed

2. **Access:**
   - Database is accessible from Railway network
   - External access available
   - Use strong passwords

3. **Backups:**
   - Railway provides automatic backups
   - Can export data manually
   - Consider regular exports

---

## 📈 Monitoring

1. **Railway Dashboard:**
   - View database metrics
   - Monitor connections
   - Check storage usage
   - View logs

2. **Usage:**
   - Free tier: $5 credit/month
   - Pay for what you use
   - Monitor usage in dashboard

---

## 🆘 Troubleshooting

### Connection Timeout
- Verify MySQL service is running
- Check host and port
- Verify credentials
- Check firewall settings

### Authentication Failed
- Verify username and password
- Check if password was regenerated
- Ensure database name is correct

### Database Not Found
- Verify database name matches `MYSQLDATABASE`
- Check if database was created
- Verify connection string

### Port Issues
- Default port is 3306
- Verify port in connection string
- Check Railway service status

---

## 💡 Tips

1. **Free Tier:**
   - $5 credit per month
   - Good for testing
   - Pay for actual usage

2. **Scaling:**
   - Railway auto-scales
   - Upgrade plan if needed
   - Monitor usage

3. **Backups:**
   - Automatic backups available
   - Export data regularly
   - Keep backups off-platform

4. **Performance:**
   - Railway MySQL is performant
   - Good for production
   - Consider connection pooling

---

## 📝 Quick Reference

### Connection String Format
```
jdbc:mysql://host:port/database
```

### Environment Variables for Render
```
DB_URL=jdbc:mysql://host:port/database
DB_USERNAME=username
DB_PASSWORD=password
JPA_DDL_AUTO=update
```

### Railway Variables
- `MYSQLHOST` → Use in `DB_URL`
- `MYSQLPORT` → Use in `DB_URL`
- `MYSQLDATABASE` → Use in `DB_URL`
- `MYSQLUSER` → Use as `DB_USERNAME`
- `MYSQLPASSWORD` → Use as `DB_PASSWORD`

---

**That's it!** Your Railway MySQL database is ready to use.

