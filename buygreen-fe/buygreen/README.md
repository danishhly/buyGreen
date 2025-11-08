# buygreen. - E-commerce Platform

A modern, eco-friendly e-commerce platform built with React and Spring Boot.

## Features

- 🛍️ Product browsing and search
- 🛒 Shopping cart and checkout
- ❤️ Wishlist functionality
- 👤 User authentication (Email/Password & Google OAuth)
- 📦 Order management
- 👨‍💼 Admin dashboard for product and user management
- 💳 Payment integration (Razorpay)
- 📱 Fully responsive design

## Tech Stack

### Frontend
- React 19
- React Router
- Tailwind CSS
- Axios
- Google OAuth

### Backend
- Spring Boot 3.5.7
- Spring Security
- JWT Authentication
- MySQL Database
- Razorpay Payment Gateway

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Java 21+
- MySQL 8+
- Maven

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd buygreen-fe/buygreen
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in `buygreen-fe/buygreen/`:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_BASE_URL=http://localhost:8080
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

4. Start the development server:
```bash
npm run dev
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd buygreen
```

2. Create a `.env` file or set environment variables:
```env
DB_URL=jdbc:mysql://localhost:3306/buygreen_db
DB_USERNAME=root
DB_PASSWORD=your_password
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_jwt_secret_key_at_least_256_bits
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

3. Update `application.properties` with your database credentials (or use environment variables)

4. Run the Spring Boot application:
```bash
mvn spring-boot:run
```

## Environment Variables

### Frontend (.env)
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:8080)
- `VITE_RAZORPAY_KEY_ID` - Razorpay Key ID for payments

### Backend (Environment Variables or application.properties)
- `DB_URL` - Database connection URL
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `RAZORPAY_KEY_ID` - Razorpay Key ID
- `RAZORPAY_KEY_SECRET` - Razorpay Key Secret
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `JWT_SECRET` - JWT secret key (at least 256 bits)
- `MAIL_HOST` - SMTP server host
- `MAIL_PORT` - SMTP server port
- `MAIL_USERNAME` - Email username
- `MAIL_PASSWORD` - Email app password

## Security Notes

⚠️ **Important**: Never commit `.env` files or `application.properties` with real credentials to version control. Use `.env.example` files as templates.

## Project Structure

```
buyGreen/
├── buygreen-fe/buygreen/     # Frontend React application
│   ├── src/
│   │   ├── Pages/            # Page components
│   │   ├── Component/        # Reusable components
│   │   ├── Context/         # React context providers
│   │   ├── Hooks/           # Custom React hooks
│   │   ├── api/             # API configuration
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
│
└── buygreen/                 # Backend Spring Boot application
    ├── src/main/java/        # Java source code
    │   ├── controller/       # REST controllers
    │   ├── service/          # Business logic
    │   ├── model/            # Entity models
    │   ├── repository/       # Data access layer
    │   └── security/         # Security configuration
    └── src/main/resources/  # Configuration files
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `mvn spring-boot:run` - Run Spring Boot application
- `mvn clean install` - Build the project

## Performance Optimizations

- ✅ Code splitting with React.lazy()
- ✅ Image lazy loading
- ✅ API response caching
- ✅ Optimized build configuration
- ✅ Input validation
- ✅ Error handling with toast notifications

## License

This project is private and proprietary.
