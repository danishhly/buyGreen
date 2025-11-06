import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  // 1. Add loading state
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading to true
    setMessage(""); // Clear previous messages

    try {
      const payload = { ...formData };
      
      // The login page does not need the interceptor, so 'axios' is correct here.
      const response = await axios.post(
        "http://localhost:8080/login",
        payload,
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      const data = response.data;
      setMessage(data.message);
      console.log("Login Success", data);

      // --- THIS IS THE FIX ---

      // 1. Get the data from the correct nested objects
      const customer = data.customer;
      const token = data.token;

      // 2. Save ONLY the two items we need.
      // All other components (Navbar, CartProvider)
      // are built to read from these two items.
      localStorage.setItem('customer', JSON.stringify(customer));
      localStorage.setItem('token', token);

      // 3. Redirect based on the 'customer' object's role
      if (customer.role === "admin") {
        navigate("/AdminDashboard");
      } else {
        navigate("/CustomerHome");
      }
      
    } catch (error) {
      console.error(error.response);
      setMessage(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false); // Set loading to false
    }
  };

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-green-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email" // Changed to type="email" for better validation
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="border border-gray-300 p-2 rounded-md"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="border border-gray-300 p-2 rounded-md"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md disabled:bg-green-300"
            disabled={isLoading} // 5. Disable button while loading
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-red-600">{message}</p>}
      </div>
    </div>
  );
}

export default Login;