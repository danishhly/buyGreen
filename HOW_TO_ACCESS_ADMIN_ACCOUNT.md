# How to Access Admin Account

## 🔍 Situation

There's **no default admin account** created automatically. Admin accounts must be created manually.

## ✅ Solution Options

### Option 1: Check if Admin Account Exists (Local Database)

1. **Connect to your local MySQL:**
   ```bash
   mysql -u root -p buygreen_db
   ```

2. **Check for admin accounts:**
   ```sql
   SELECT id, name, email, role FROM customers WHERE role = 'admin';
   ```

3. **If you find an admin account:**
   - Use that email and password to log in
   - If you forgot the password, see Option 3 below

### Option 2: Create Admin Account via Database (Recommended)

#### For Local Database:

1. **Connect to local MySQL:**
   ```bash
   mysql -u root -p buygreen_db
   ```

2. **Create admin account:**
   ```sql
   -- First, check if email already exists
   SELECT * FROM customers WHERE email = 'admin@buygreen.com';
   
   -- If it doesn't exist, create admin account
   -- Password will be hashed by Spring Security, so we need to use a tool or create via API
   ```

**Better approach - Use the signup API then update role:**

1. **Sign up normally** via the website with your desired admin email
2. **Then update the role in database:**
   ```sql
   UPDATE customers SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

#### For Railway Database (Production):

1. **Wait for Railway MySQL to connect** (green checkmark)

2. **Connect to Railway MySQL:**
   - Get connection details from Railway → MySQL service → Variables tab
   - Use MySQL client or Railway's web interface

3. **Create admin account:**
   ```sql
   -- First sign up via website, then:
   UPDATE customers SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

### Option 3: Reset Admin Password

If you have an admin account but forgot the password:

1. **Connect to database:**
   ```bash
   mysql -u root -p buygreen_db
   ```

2. **Check admin email:**
   ```sql
   SELECT email FROM customers WHERE role = 'admin';
   ```

3. **Use Forgot Password feature:**
   - Go to `/forgot-password` on your website
   - Enter the admin email
   - Check email for reset link
   - Reset password

### Option 4: Create Admin via API (If Backend is Running)

1. **Sign up normally** via website:
   - Go to `/signup`
   - Use email: `admin@buygreen.com` (or your preferred email)
   - Set password
   - Sign up

2. **Update role to admin:**
   - Connect to database
   - Run: `UPDATE customers SET role = 'admin' WHERE email = 'admin@buygreen.com';`

## 📋 Step-by-Step: Create Your First Admin Account

### Step 1: Sign Up as Regular User

1. Go to your website: `https://buygreen.vercel.app/signup`
2. Fill in:
   - **Name:** Your Name
   - **Email:** `admin@buygreen.com` (or your email)
   - **Password:** Choose a strong password
3. Click "Create Account"

### Step 2: Update Role to Admin

**For Local Database:**
```bash
mysql -u root -p buygreen_db
```
```sql
UPDATE customers SET role = 'admin' WHERE email = 'admin@buygreen.com';
SELECT email, role FROM customers WHERE email = 'admin@buygreen.com';
```

**For Railway Database (Production):**
1. Wait for Railway MySQL to connect
2. Connect to Railway MySQL (see connection details in Railway dashboard)
3. Run:
   ```sql
   UPDATE customers SET role = 'admin' WHERE email = 'admin@buygreen.com';
   ```

### Step 3: Log In as Admin

1. Go to `/login`
2. Enter:
   - **Email:** `admin@buygreen.com`
   - **Password:** (the password you set)
3. Click "Sign In"
4. You should be redirected to `/AdminDashboard`

## 🔧 Quick SQL Commands

### Check all users:
```sql
SELECT id, name, email, role FROM customers;
```

### Make existing user admin:
```sql
UPDATE customers SET role = 'admin' WHERE email = 'existing-user@example.com';
```

### Create admin directly (requires password hash):
```sql
-- This is complex because password must be hashed
-- Better to sign up first, then update role
```

### Check admin accounts:
```sql
SELECT id, name, email, role FROM customers WHERE role = 'admin';
```

## ⚠️ Important Notes

1. **Password Hashing:** Passwords are hashed by Spring Security (BCrypt). You can't set a plain text password directly in the database.

2. **Role Values:** The role must be exactly `'admin'` (lowercase) to match Spring Security's `hasRole("ADMIN")` check.

3. **Multiple Admins:** You can have multiple admin accounts. Just set `role = 'admin'` for any user.

4. **Security:** Keep admin credentials secure. Don't use simple passwords.

## 🎯 Recommended Approach

**For Production (Railway):**
1. Wait for Railway MySQL to connect
2. Sign up via website with your admin email
3. Connect to Railway MySQL
4. Update role: `UPDATE customers SET role = 'admin' WHERE email = 'your-email@example.com';`
5. Log in and access Admin Dashboard

**For Local Development:**
1. Sign up via local website
2. Connect to local MySQL
3. Update role: `UPDATE customers SET role = 'admin' WHERE email = 'your-email@example.com';`
4. Log in locally

---

**There's no default admin account. Create one by signing up, then updating the role in the database!**

