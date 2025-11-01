import { Routes, Route, Outlet } from "react-router-dom"
import Home from "./Pages/Home.jsx"
import Signup from "./Pages/Signup.jsx"
import Login from "./Pages/Login.jsx"
import AdminDashboard from "./Pages/AdminDashboard.jsx"
import CustomerHome from "./Pages/CustomerHome.jsx"
import CartPage from './Pages/CartPage.jsx';
import { CartProvider } from './Context/CartProvider.jsx'
import Navbar from './Component/Navbar.jsx';
import React from 'react';

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
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/CustomerHome" element={<CustomerHome />} />
        <Route path="/cart" element={<CartPage />} />
      </Route>
    </Routes>
    </CartProvider>
  );
}

export default App
