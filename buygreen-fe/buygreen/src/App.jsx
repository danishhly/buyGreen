import { Routes, Route } from "react-router-dom"
import Home from "./Pages/Home.jsx"
import Signup from "./Pages/Signup.jsx"
import Login from "./Pages/Login.jsx"
import AdminDashboard from "./Pages/AdminDashboard.jsx"
import CustomerHome from "./Pages/CustomerHome.jsx"


function App() {
 

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/AdminDashboard" element={<AdminDashboard />} />
      <Route path="/CustomerHome" element={<CustomerHome />} />
    </Routes>
  );
}

export default App
