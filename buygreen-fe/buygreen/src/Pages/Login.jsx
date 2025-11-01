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
    setIsLoading(true); // 2. Set loading to true before API call
    setMessage(""); // Clear previous messages

    try {
      const payload = {
        ...formData
      };
      const response = await axios.post(
        "http://localhost:8080/login",
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      const data = response?.data || {};
      setMessage(data.message);
      console.log("Login Success", response.data);

      const customer = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role
      };

      // 3. Save user data to localStorage
      // This makes the user's name and role available across your entire app
      if (data.id !== undefined && data.id !== null) {
        localStorage.setItem('customerId', String(data.id));
      }
      if (customer.name) {
        localStorage.setItem('customerName', customer.name);
      }

      if (customer.role) {
        localStorage.setItem('Role', customer.role);
      }

      localStorage.setItem('customer', JSON.stringify(customer));

      // You should also store the authentication token here if your API sends one
      //  if (data.token) {
      //   localStorage.setItem('authToken', response.data.token);
      // }

      // Redirect after login
      if (data.role === "admin") {
        navigate("/AdminDashboard");
      } else {
        navigate("/CustomerHome");
      }
    } catch (error) {
      console.error(error.response);
      setMessage(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false); // 4. Set loading to false after API call completes
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