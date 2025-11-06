import React, { useState } from 'react';
import axios from "axios";
// 1. Import Link for navigation and GoogleLogin
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // This is your existing, correct handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(""); 

    try {
      const payload = { ...formData };
      
      const response = await axios.post(
        "http://localhost:8080/login",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data;
      setMessage(data.message);
      console.log("Login Success", data);

      const customer = data.customer;
      const token = data.token;

      localStorage.setItem('customer', JSON.stringify(customer));
      localStorage.setItem('token', token);

      if (customer.role === "admin") {
        navigate("/AdminDashboard");
      } else {
        navigate("/CustomerHome");
      }
      
    } catch (error) {
      console.error(error.response);
      setMessage(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. This is the Google login logic copied from your Signup.jsx
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(
          "http://localhost:8080/auth/google",
          { token: credentialResponse.credential }
      );
      
      const customer = response.data.customer;
      const token = response.data.token;

      localStorage.setItem('customer', JSON.stringify(customer));
      localStorage.setItem('token', token);
      
      if (customer.role === "admin") {
          navigate("/AdminDashboard");
      } else {
          navigate("/CustomerHome");
      }

    } catch (error) {
      setMessage(error.response?.data?.message || "Google login failed.");
      console.error(error);
    }
  };

  const handleGoogleError = () => {
    setMessage("Google login failed. Please try again.");
  };

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-green-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        
        {/* 3. Added a link to the Home page */}
        <Link to="/" className="text-2xl font-bold text-green-700 mb-6 text-center block">
          BuyGreen
        </Link>
        
        <h2 className="text-xl font-semibold text-gray-700 mb-6 text-center">
          Login to your Account
        </h2>

        {/* 4. Added Google Sign-in Button */}
        <div className="flex flex-col items-center mb-4">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
            />
        </div>

        <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
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
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-red-600">{message}</p>}
        
        {/* 5. Added Sign up and Forgot Password links */}
        <div className="text-sm text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-green-600 hover:underline">
              Sign up
            </Link>
          </p>
          <p className="mt-2">
            <Link to="/forgot-password" className="font-medium text-green-600 hover:underline">
                Forgot password?
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;