import { Routes, Route, Outlet, Navigate } from "react-router-dom"
import Home from "./Pages/Home.jsx"
import Signup from "./Pages/Signup.jsx"
import Login from "./Pages/Login.jsx"
import AdminDashboard from "./Pages/AdminDashboard.jsx"
import CustomerHome from "./Pages/CustomerHome.jsx"
import CartPage from './Pages/CartPage.jsx';
import OrderSuccess from './Pages/OrderSuccess.jsx';
import Orders from './Pages/Orders.jsx';
import Profile from './Pages/Profile.jsx';
import { CartProvider } from './Context/CartProvider.jsx'
import Navbar from './Component/Navbar.jsx';
import Footer from './Component/Footer.jsx';
import AdminLayout from './Component/AdminLayout.jsx';
import React from 'react';
import ProductDetails from './Pages/ProductDetails.jsx';
import ForgotPassword from "./Pages/ForgotPassword.jsx"; 
import ResetPassword from "./Pages/ResetPassword.jsx";
import AdminRoute from "./Component/AdminRoute.jsx";
import CustomerRoute from "./Component/CustomerRoute.jsx";
import WishlistPage from "./Pages/WishlistPage.jsx";
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
      <Routes>
        {/* === PUBLIC ROUTES === */}
        {/* These pages don't have a navbar */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Navigate to="/signup" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* 3. ADD ROUTE */}
        <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* === CUSTOMER ROUTES === */}
        {/* These pages require a user to be logged in */}
        <Route element={<CustomerRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/CustomerHome" element={<CustomerHome />} />
            <Route path="/cart" element={<CartPage />} />
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

      </Routes>
    </CartProvider>
  );
}
export default App
