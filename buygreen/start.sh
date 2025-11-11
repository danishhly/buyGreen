#!/bin/bash

# ============================================
# BuyGreen Backend Startup Script (Linux/macOS)
# ============================================
# Set all environment variables here
# ============================================

# Database Configuration
# ⚠️ IMPORTANT: Replace 'your_password_here' with your actual MySQL password
export DB_URL=jdbc:mysql://localhost:3306/buygreen_db
export DB_USERNAME=root
export DB_PASSWORD=0598

# JPA Configuration
export JPA_DDL_AUTO=update
export JPA_SHOW_SQL=false

# JWT Configuration
export JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here_at_least_256_bits

# Razorpay Configuration
export RAZORPAY_KEY_ID=your_razorpay_key_id
export RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Google OAuth Configuration
export GOOGLE_CLIENT_ID=your_google_client_id

# Email Configuration
export MAIL_HOST=smtp.gmail.com
export MAIL_PORT=465
export MAIL_USERNAME=your_email@gmail.com
export MAIL_PASSWORD=your_email_app_password

# Frontend URL Configuration
export FRONTEND_URL=http://localhost:5173
export CORS_ALLOWED_ORIGINS=http://localhost:5173

# ============================================
# Start the application
# ============================================
echo "Starting BuyGreen Backend..."
echo ""
echo "Make sure you've updated all the environment variables above!"
echo ""

java -jar target/buygreen-0.0.1-SNAPSHOT.jar

