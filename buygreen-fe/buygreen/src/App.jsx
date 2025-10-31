import { Routes, Route } from "react-router-dom"
import Home from "./Pages/Home.jsx"
import Signup from "./Pages/Signup.jsx"
import Login from "./Pages/Login.jsx"
import AdminDashboard from "./Pages/AdminDashboard.jsx"
import CustomerHome from "./Pages/CustomerHome.jsx"
import CartPage from './Pages/CartPage.jsx';
import Navbar from './Component/Navbar.jsx';
import { CartProvider } from './Context/CartProvider.jsx'

function App() {
 

  return (
    <CartProvider>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/AdminDashboard" element={<AdminDashboard />} />
      <Route path="/CustomerHome" element={<CustomerHome />} />
      <Route path="/cart" element={<CartPage />} />
    </Routes>
    </CartProvider>
  );
}

export default App
