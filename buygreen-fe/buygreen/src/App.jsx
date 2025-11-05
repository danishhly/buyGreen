import { Routes, Route, Outlet } from "react-router-dom"
import Home from "./Pages/Home.jsx"
import Signup from "./Pages/Signup.jsx"
import Login from "./Pages/Login.jsx"
import AdminDashboard from "./Pages/AdminDashboard.jsx"
import CustomerHome from "./Pages/CustomerHome.jsx"
import CartPage from './Pages/CartPage.jsx';
import OrderSuccess from './Pages/OrderSuccess.jsx';
import Orders from './Pages/Orders.jsx';
import { CartProvider } from './Context/CartProvider.jsx'
import Navbar from './Component/Navbar.jsx';
import React from 'react';
import ProductDetails from './Pages/ProductDetails.jsx';

import AdminRoute from "./Component/AdminRoute.jsx";
import CustomerRoute from "./Component/CustomerRoute.jsx";

const AppLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

const PublicLayout = () => <Outlet />;

function App() {
  return (
    <CartProvider>
      <Routes>
        {/* === PUBLIC ROUTES === */}
        {/* These pages don't have a navbar */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* === CUSTOMER ROUTES === */}
        {/* These pages require a user to be logged in */}
        <Route element={<CustomerRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/CustomerHome" element={<CustomerHome />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
          </Route>
        </Route>

        {/* === ADMIN ROUTES === */}
        {/* These pages require a user to be an ADMIN */}
        <Route element={<AdminRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

      </Routes>
    </CartProvider>
  );
}
export default App
