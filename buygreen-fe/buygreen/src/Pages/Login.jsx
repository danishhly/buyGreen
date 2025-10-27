import React, { useState } from 'react'
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
 const[formData, setFormData] = useState({
  email: "",
  password: ""
 });

 const [message, setMessage] = useState("");
 const navigate = useNavigate();

 const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
 };

 const handleSubmit = async(e) => {
  e.preventDefault();
  try {
    const response = await axios.post(
      "http://localhost:8080/login",
      formData,
      { headers : {
        "content-type": "application/json"
      }}
    );

    setMessage(response.data.message);
    console.log("Login Success", response.data);

    // redirect after login

    if(response.data.role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/Home");
    }
  } catch (error) {
    setMessage(error.response?.data?.message || "Login failed ");
    console.error(error.response);
  }
 };


 return (
   <div className="w-full flex items-center justify-center min-h-screen bg-green-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">
          Login
          </h1>

          <form onSubmit = {handleSubmit} className="flex flex-col space-y-4">
            <input
            type="text"
            name="email"
            placeholder="Email"
            onChange = {handleChange}
            required
            className = "border border-gray-300 p-2 rounded-md"
            />

            <input
            type="password"
            name="password"
            placeholder="Password"
            onChange = {handleChange}
            required
            className = "border border-gray-300 p-2 rounded-md"
            />

            <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md"
            >
              Login
            </button>
          </form>

          {message && <p className="mt-4 text-center text-gray-600">{message}</p>}
          </div>
          </div>
 )
}
export default Login;