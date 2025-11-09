@echo off
REM ============================================
REM BuyGreen Backend Startup Script (Windows)
REM ============================================
REM Set all environment variables here
REM ============================================

REM Database Configuration
REM ⚠️ IMPORTANT: Replace 'your_password_here' with your actual MySQL password
set DB_URL=jdbc:mysql://localhost:3306/buygreen_db
set DB_USERNAME=root
set DB_PASSWORD=0598

REM JPA Configuration
set JPA_DDL_AUTO=update
set JPA_SHOW_SQL=false

REM JWT Configuration
set JWT_SECRET=0886c172ca70630c7a458eb61aa7fc92b13e3e5dd9d2cea5baf4e8e0b43ced129688c897

REM Razorpay Configuration
set RAZORPAY_KEY_ID=rzp_test_RdimoEoYcYRvFQ
set RAZORPAY_KEY_SECRET=XAz0a63Em2tDfPeKejH34L0s

REM Google OAuth Configuration
set GOOGLE_CLIENT_ID=189236141996-658di7k0m2fuf4taqpn45uep5ivjgdi3.apps.googleusercontent.com

REM Email Configuration
set MAIL_HOST=smtp.gmail.com
set MAIL_PORT=587
set MAIL_USERNAME=dnsh.1inn@gmail.com
set MAIL_PASSWORD=curn acmo ysdz yegj

REM Frontend URL Configuration
set FRONTEND_URL=http://localhost:5173
set CORS_ALLOWED_ORIGINS=http://localhost:5173

REM ============================================
REM Start the application
REM ============================================
echo Starting BuyGreen Backend...
echo.
echo Make sure you've updated all the environment variables above!
echo.
java -jar target/buygreen-0.0.1-SNAPSHOT.jar

pause

