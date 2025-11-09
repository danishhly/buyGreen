# How to Change Admin Email ID

There are two ways to change your admin email ID:

## Option 1: Using the API Endpoint (Recommended)

1. **Log in to your application** as the admin user with your current email and password.

2. **Make a POST request** to the `/customers/change-email` endpoint with:
   - Your current password
   - Your new email address

   You can use:
   - **Postman/Insomnia**: 
     - URL: `http://localhost:8080/customers/change-email`
     - Method: POST
     - Headers: 
       - `Content-Type: application/json`
       - `Authorization: Bearer <your_jwt_token>` (get this from login)
     - Body (JSON):
       ```json
       {
         "newEmail": "your-new-email@example.com",
         "password": "your-current-password"
       }
       ```

   - **cURL command**:
     ```bash
     curl -X POST http://localhost:8080/customers/change-email \
       -H "Content-Type: application/json" \
       -H "Authorization: Bearer YOUR_JWT_TOKEN" \
       -d '{
         "newEmail": "your-new-email@example.com",
         "password": "your-current-password"
       }'
     ```

3. **After successful change**, you'll receive a new JWT token. Use this new token for future requests.

## Option 2: Direct Database Update

If you prefer to update the database directly:

1. **Connect to your MySQL database**:
   - Database: `buygreen_db`
   - Host: `localhost:3306`
   - Username: `root` (or your DB_USERNAME)
   - Password: Your database password

2. **Run this SQL command** (replace `old-email@example.com` with your current admin email and `new-email@example.com` with your new email):

   ```sql
   UPDATE customers 
   SET email = 'new-email@example.com' 
   WHERE email = 'old-email@example.com' 
   AND role = 'admin';
   ```

3. **Verify the update**:
   ```sql
   SELECT id, name, email, role 
   FROM customers 
   WHERE role = 'admin';
   ```

4. **Important**: After updating the database directly, you'll need to:
   - Log out and log back in with your new email
   - The old JWT token will still work until it expires, but you should use the new email for future logins

## Notes

- The new email must not already exist in the database
- The email format will be validated
- After changing the email, you'll need to use the new email for future logins
- If you change the email via database, make sure to update any other systems that reference the old email

