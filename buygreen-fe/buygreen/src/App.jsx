import { Routes, Route, Outlet, Navigate } from "react-router-dom"
import React, { Suspense, lazy } from 'react';
import { CartProvider } from './Context/CartProvider.jsx'
import Navbar from './Component/Navbar.jsx';
import Footer from './Component/Footer.jsx';
import AdminLayout from './Component/AdminLayout.jsx';
import AdminRoute from "./Component/AdminRoute.jsx";
import CustomerRoute from "./Component/CustomerRoute.jsx";

// Lazy load components for code splitting
const Home = lazy(() => import("./Pages/Home.jsx"));
const Signup = lazy(() => import("./Pages/Signup.jsx"));
const Login = lazy(() => import("./Pages/Login.jsx"));
const AdminDashboard = lazy(() => import("./Pages/AdminDashboard.jsx"));
const CustomerHome = lazy(() => import("./Pages/CustomerHome.jsx"));
const CartPage = lazy(() => import('./Pages/CartPage.jsx'));
const PaymentPage = lazy(() => import('./Pages/PaymentPage.jsx'));
const OrderSuccess = lazy(() => import('./Pages/OrderSuccess.jsx'));
const Orders = lazy(() => import('./Pages/Orders.jsx'));
const Profile = lazy(() => import('./Pages/Profile.jsx'));
const ProductDetails = lazy(() => import('./Pages/ProductDetails.jsx'));
const ForgotPassword = lazy(() => import("./Pages/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./Pages/ResetPassword.jsx"));
const WishlistPage = lazy(() => import("./Pages/WishlistPage.jsx"));
const NotFound = lazy(() => import("./Pages/NotFound.jsx"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700"></div>
  </div>
);
const AppLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <div className="flex-grow">
      <Outlet />
    </div>
    <Footer />
  </div>
);

const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <div className="flex-grow">
      <Outlet />
    </div>
    <Footer />
  </div>
);

function App() {
  return (
    <CartProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* === PUBLIC ROUTES === */}
          {/* These pages don't have a navbar */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Navigate to="/signup" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* === CUSTOMER ROUTES === */}
          {/* These pages require a user to be logged in */}
          <Route element={<CustomerRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/CustomerHome" element={<CustomerHome />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/product/:productId" element={<ProductDetails />} />
              <Route path="/wishlist" element={<WishlistPage />} />
            </Route>
          </Route>

          {/* === ADMIN ROUTES === */}
          {/* These pages require a user to be an ADMIN */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/AdminDashboard" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* 404 Not Found - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </CartProvider>
  );
}
export default App
