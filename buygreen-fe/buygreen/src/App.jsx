import { Routes, Route, BrowserRouter } from "react-router-dom"
import Home from "./Pages/Home.jsx"
import Signup from "./Pages/Signup.jsx"
import Login from "./Pages/Login.jsx"


function App() {
 

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home><h1>Welcome, Customer</h1></Home>} />
      <Route path="/admin-dashboard" element={<h1>Welcome, Admin!</h1>} />
    </Routes>
  );
}

export default App
