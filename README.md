# BuyGreen - E-commerce Platform

Hey! This is BuyGreen, an e-commerce platform I built for selling eco-friendly products. It's got a React frontend and a Spring Boot backend, and it's fully deployed and working.

## What's in here

- **Frontend**: React app with Vite (in `buygreen-fe/buygreen/`)
- **Backend**: Spring Boot API (in `buygreen/`)
- **Database**: MySQL (using Aiven in production)

## Getting it running locally

### Frontend setup

```bash
cd buygreen-fe/buygreen
npm install
npm run dev
```

Runs on `http://localhost:5173` by default.

### Backend setup

You'll need Java 21 and Maven installed. Then:

**Windows:**
```bash
cd buygreen
.\start.local.bat
```

**Linux/Mac:**
```bash
cd buygreen
./start.sh
```

Or just run `mvn spring-boot:run` if you've set up your environment variables another way.

Backend runs on `http://localhost:8080`.

## Environment variables you need

I keep my actual credentials in `start.local.bat` (which is gitignored). You'll need to set these up:

**Database:**
- MYSQLHOST
- MYSQLPORT
- MYSQLDATABASE
- MYSQLUSER
- MYSQLPASSWORD

**JWT Secret:**
- JWT_SECRET (just a random long string)

**Razorpay (for payments):**
- RAZORPAY_KEYID
- RAZORPAY_SECRET

**Google OAuth:**
- GOOGLE_CLIENTID

**Email (using SendGrid):**
- MAIL_HOST=smtp.sendgrid.net
- MAIL_PORT=2525
- MAIL_USERNAME=apikey
- MAIL_PASSWORD=your_sendgrid_api_key
- EMAIL_SERVICE_MODE=smtp
- ADMIN_EMAIL=your_admin_email@gmail.com
- SENDER_EMAIL=your_sender_email@gmail.com

**Frontend URL:**
- FRONTEND_URL=http://localhost:5173 (or your production URL)

## Features

- User authentication (email/password + Google OAuth)
- Product browsing and search
- Shopping cart
- Wishlist
- Order placement with Razorpay payment integration
- Order management (admin can update status)
- Email notifications (order confirmations, status updates, admin alerts)
- Product reviews and ratings
- Coupon system
- Admin dashboard with analytics
- Inventory management

## Making someone an admin

After signing up, go to your database and run:

```sql
UPDATE customers SET role = 'admin' WHERE email = 'their-email@example.com';
```

Then they can log in and access the admin dashboard.

## Deployment

**Frontend**: Deployed on Vercel
**Backend**: Deployed on Render
**Database**: Aiven MySQL

The backend has a health check endpoint at `/health` that I use with UptimeRobot to keep it from spinning down on the free tier.

## Keeping the app alive

If you're on Render's free tier, the app spins down after 15 minutes of inactivity. I use UptimeRobot to ping `https://your-app.onrender.com/health` every 5 minutes to keep it awake. You can set that up at uptimerobot.com - it's free and works great.

## Notes

- Never commit actual credentials to Git. I keep them in `start.local.bat` which is gitignored.
- The email system uses SendGrid's SMTP relay, which works way better than trying to use Gmail directly (especially on cloud platforms).
- All emails are sent asynchronously so they don't slow down order processing.

That's pretty much it. If you have questions, check the code - it's pretty straightforward.
