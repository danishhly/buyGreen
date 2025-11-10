# application.properties Guide - What to Add

## ✅ Your Current Setup is CORRECT!

Your `application.properties` is already properly configured. **You don't need to change anything!**

## 📋 How It Works

### Current Configuration (Correct ✅)

```properties
# Database - Uses environment variables
spring.datasource.url=jdbc:mysql://${MYSQLHOST}:${MYSQLPORT}/${MYSQLDATABASE}
spring.datasource.username=${MYSQLUSER}
spring.datasource.password=${MYSQLPASSWORD}

# Razorpay - Uses environment variables
razorpay.keyId=${RAZORPAY_KEYID}
razorpay.keySecret=${RAZORPAY_SECRET}

# JWT - Uses environment variables
jwt.secret=${JWT_SECRET}

# Email - Uses environment variables
spring.mail.host=${MAIL_HOST:smtp.gmail.com}
spring.mail.port=${MAIL_PORT:587}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}

# Frontend URL - Uses environment variables
frontend.url=${FRONTEND_URL:http://localhost:5173}
```

## 🔑 Key Points

### 1. Environment Variable Syntax
- `${VARIABLE_NAME}` - Reads from environment variable
- `${VARIABLE_NAME:default}` - Uses default if variable not set

### 2. Where Values Come From

**Local Development:**
- From `.env` file (in `buygreen/` folder)
- Spring Boot automatically reads `.env` files

**Production (Render):**
- From Render Environment Variables
- Set in Render Dashboard → Environment tab

### 3. What You Should NOT Add

❌ **NEVER add actual values:**
```properties
# ❌ DON'T DO THIS - Exposes secrets!
spring.datasource.password=ZCuqTUpUkMmrjtGSTzayNrWMAXZUTICt
razorpay.keySecret=XAz0a63Em2tDfPeKejH34L0s
jwt.secret=0886c172ca70630c7a458eb61aa7fc92b13e3e5dd9d2cea5baf4e8e0b43ced129688c897
```

✅ **ALWAYS use environment variables:**
```properties
# ✅ DO THIS - Safe!
spring.datasource.password=${MYSQLPASSWORD}
razorpay.keySecret=${RAZORPAY_SECRET}
jwt.secret=${JWT_SECRET}
```

## 📝 Complete application.properties (Current - No Changes Needed)

Your file is already correct. Here's what it should look like:

```properties
spring.application.name=buygreen

# Database Configuration
spring.datasource.url=jdbc:mysql://${MYSQLHOST}:${MYSQLPORT}/${MYSQLDATABASE}
spring.datasource.username=${MYSQLUSER}
spring.datasource.password=${MYSQLPASSWORD}

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Razorpay Configuration
razorpay.keyId=${RAZORPAY_KEYID}
razorpay.keySecret=${RAZORPAY_SECRET}

# Google OAuth Configuration
google.clientId=${GOOGLE_CLIENTID}

# JWT Configuration
jwt.secret=${JWT_SECRET}

# Email Configuration
spring.mail.host=${MAIL_HOST:smtp.gmail.com}
spring.mail.port=${MAIL_PORT:587}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Frontend URL Configuration
frontend.url=${FRONTEND_URL:http://localhost:5173}
```

## ✅ Summary

**You don't need to change `application.properties`!**

1. ✅ It already uses environment variables correctly
2. ✅ No hardcoded secrets
3. ✅ Works for both local and production

**Just set the environment variables in:**
- **Local:** `.env` file (already done)
- **Render:** Environment Variables tab (do this now)

---

**Your `application.properties` is perfect as-is! Just set the variables in Render!**

