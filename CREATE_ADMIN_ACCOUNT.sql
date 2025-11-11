-- ============================================
-- Create Admin Account - SQL Script
-- ============================================
-- 
-- IMPORTANT: This script assumes you've already signed up
-- via the website. It only updates the role to 'admin'.
--
-- If you haven't signed up yet:
-- 1. Go to /signup on your website
-- 2. Create account with your desired admin email
-- 3. Then run this script to make them admin
--
-- ============================================

-- Step 1: Check existing users
SELECT id, name, email, role FROM customers;

-- Step 2: Make a user admin (replace email with your admin email)
UPDATE customers 
SET role = 'admin' 
WHERE email = 'admin@buygreen.com';

-- Step 3: Verify admin was created
SELECT id, name, email, role 
FROM customers 
WHERE role = 'admin';

-- Step 4: Check specific user
SELECT id, name, email, role 
FROM customers 
WHERE email = 'admin@buygreen.com';

-- ============================================
-- Alternative: Make multiple users admin
-- ============================================
-- UPDATE customers SET role = 'admin' WHERE email IN ('admin1@example.com', 'admin2@example.com');

-- ============================================
-- Reset: Make user regular customer again
-- ============================================
-- UPDATE customers SET role = 'customer' WHERE email = 'admin@buygreen.com';

