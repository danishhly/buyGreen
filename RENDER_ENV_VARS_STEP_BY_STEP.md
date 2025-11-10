# Step-by-Step: Set Environment Variables in Render

## 🎯 Visual Guide

### Step 1: Open Your Render Service
1. Go to https://render.com
2. Login to your account
3. Click on your **backend service** (e.g., `buygreen-backend`)

### Step 2: Navigate to Environment Variables
1. Click **"Environment"** tab (at the top)
2. Or go to **"Settings"** → Scroll down to **"Environment Variables"**

### Step 3: Add Variables
1. Click **"Add Environment Variable"** button (green + button)
2. A new row appears with two fields:
   - **NAME** (left field)
   - **value** (right field - multi-line text area)

### Step 4: Add Each Variable

**For each variable, do this:**
1. Click in the **NAME** field → Type the variable name
2. Click in the **value** field → Type the value
3. Click **"Add Environment Variable"** again for the next one

### Step 5: Variables to Add (In Order)

#### 1. Database Variables (from Railway)
```
NAME: MYSQLHOST
value: interchange.proxy.rlwy.net
```

```
NAME: MYSQLPORT
value: 55721
```

```
NAME: MYSQLDATABASE
value: railway
```

```
NAME: MYSQLUSER
value: root
```

```
NAME: MYSQLPASSWORD
value: ZCuqTUpUkMmrjtGSTzayNrWMAXZUTICt
```

#### 2. Email Variables
```
NAME: MAIL_HOST
value: smtp.gmail.com
```

```
NAME: MAIL_PORT
value: 587
```

```
NAME: MAIL_USERNAME
value: dnsh.1inn@gmail.com
```

```
NAME: MAIL_PASSWORD
value: curn acmo ysdz yegj
```

#### 3. Other Variables
```
NAME: JWT_SECRET
value: 0886c172ca70630c7a458eb61aa7fc92b13e3e5dd9d2cea5baf4e8e0b43ced129688c897
```

```
NAME: RAZORPAY_KEYID
value: rzp_test_RdimoEoYcYRvFQ
```

```
NAME: RAZORPAY_SECRET
value: XAz0a63Em2tDfPeKejH34L0s
```

```
NAME: GOOGLE_CLIENTID
value: 189236141996-658di7k0m2fuf4taqpn45uep5ivjgdi3.apps.googleusercontent.com
```

```
NAME: FRONTEND_URL
value: https://your-app.vercel.app
```
*(Update this after deploying to Vercel)*

```
NAME: CORS_ALLOWED_ORIGINS
value: https://your-app.vercel.app
```
*(Update this after deploying to Vercel)*

### Step 6: Save
1. After adding all variables
2. Scroll down
3. Click **"Save Changes"** button
4. Render will automatically redeploy

---

## 📸 What It Looks Like

After adding variables, you'll see a list like:
```
MYSQLHOST = interchange.proxy.rlwy.net
MYSQLPORT = 55721
MYSQLDATABASE = railway
...
```

Each variable has:
- Name on the left
- Value on the right (may be masked for passwords)
- Delete button (trash icon) on the right

---

## ✅ Verification

After saving:
1. Check that all variables are listed
2. Wait for deployment to complete
3. Check logs - should see application starting successfully
4. No more email configuration errors

---

**That's it! Your environment variables are now set in Render!**

