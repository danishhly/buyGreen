@echo off
REM ============================================
REM BuyGreen Backend Startup Script (Windows)
REM ============================================
REM Set all environment variables here
REM ============================================

REM Database Configuration
REM ⚠️ IMPORTANT: Set your Aiven MySQL connection details here
REM For Aiven: Get these from your Aiven dashboard
REM For Local: Use localhost:3306
REM ⚠️ SECURITY: Never commit actual passwords to Git!
REM Set these values locally or use environment variables
set MYSQLHOST=your_aiven_host_here
set MYSQLPORT=your_aiven_port_here
set MYSQLDATABASE=defaultdb
set MYSQLUSER=avnadmin
set MYSQLPASSWORD=your_aiven_password_here

REM JPA Configuration
set JPA_DDL_AUTO=update
set JPA_SHOW_SQL=false

REM JWT Configuration
REM ⚠️ SECURITY: Never commit actual secrets to Git!
set JWT_SECRET=your_jwt_secret_here

REM Razorpay Configuration
REM ⚠️ SECURITY: Never commit actual API keys to Git!
set RAZORPAY_KEY_ID=your_razorpay_key_id_here
set RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

REM Google OAuth Configuration
set GOOGLE_CLIENT_ID=your_google_client_id_here

REM Email Configuration
REM ⚠️ SECURITY: Never commit actual email passwords to Git!
REM Note: Port 465 (SSL) is used instead of 587 (STARTTLS) to avoid firewall issues
set MAIL_HOST=smtp.gmail.com
set MAIL_PORT=465
set MAIL_USERNAME=your_email@gmail.com
set MAIL_PASSWORD=your_email_app_password_here

REM SendGrid Configuration (HTTP API fallback)
set SENDGRID_API_KEY=your_sendgrid_api_key_here
set EMAIL_SERVICE_MODE=sendgrid

REM Frontend URL Configuration
set FRONTEND_URL=http://localhost:5173
set CORS_ALLOWED_ORIGINS=http://localhost:5173




