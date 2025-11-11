# buygreen. - Eco-Friendly E-commerce Platform

A modern e-commerce platform for eco-friendly products built with React and Spring Boot.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Java 21+
- MySQL 8+
- Maven

### Local Development

**Frontend:**
```bash
cd buygreen-fe/buygreen
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

**Backend:**
```bash
cd buygreen
# Use start.bat (Windows) or start.sh (Linux/Mac)
# Or: mvn spring-boot:run
```
Backend runs on `http://localhost:8080`

## 📋 Environment Variables

### Frontend (`buygreen-fe/buygreen/.env`)
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Backend
Set these in `start.bat` / `start.sh` or as environment variables:
- Database: `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`
- JWT: `JWT_SECRET`
- Razorpay: `RAZORPAY_KEYID`, `RAZORPAY_SECRET`
- Google OAuth: `GOOGLE_CLIENTID`
- Email: `MAIL_USERNAME`, `MAIL_PASSWORD`

## 🌐 Deployment

- **Frontend:** Vercel (see `buygreen-fe/vercel.json`)
- **Backend:** Render (Docker)
- **Database:** Railway MySQL

See deployment guides in the project root for detailed setup.

## 🔑 Admin Access

1. Sign up via website
2. Update role in database: `UPDATE customers SET role = 'admin' WHERE email = 'your-email@example.com';`
3. Log in to access Admin Dashboard

## 📁 Project Structure

```
buyGreen/
├── buygreen-fe/buygreen/  # Frontend (React)
└── buygreen/              # Backend (Spring Boot)
```

## ⚠️ Security

Never commit `.env` files or credentials to Git. Use environment variables for production.

---

**For detailed setup instructions, see the guides in the project root.**

