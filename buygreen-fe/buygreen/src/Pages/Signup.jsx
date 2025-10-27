import React, { useState } from 'react';
import axios from 'axios';

function Signup() {
    const[formData,setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role:"customer", // Default role is customer
    });

    const[message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
const response = await axios.post(
    "http://localhost:8080/signup",
    formData,
    {
        headers: {
            "Content-Type": "application/json"
        }
    }
);
            setMessage(response.data.message || "Signup successful!");
        } catch (error) {
            setMessage(error.response?.data?.message || "Error during signup.");
            console.log(error.response);


        }
    };

    return(
        <div className ="w-full flex items-center justify-center min-h-screen bg-screen-50">
        <div className ="w-full max-w-md rounded-lg bg-white p-8 shadow">
            <h1 className ="text-2xl fon-bold text-green-700 mb-6 text-center">
                BuyGreen Signup
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
                <input
                type="text"
                name="name"
                placeholder="Full name"
                onChange={handleChange}
                required
                className ="mt-1 w-full border border-gray-300 p-2 rounded-md"
                />

            <input 
            type="text"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="mt-1 w-full border border-gray-300 p-2 rounded-md"
            />

            <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="mt-1 w-full border border-gray-300 p-5 rounded-md "
            />

            <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 p-2 rounded-md"
            >

            <option value="customer">Customer</option>
            <option value="admin">Admin</option>

            </select>

            <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md"
            >
                Create Account
            </button>

            </form>

            {message && <p className="mt-4 text-center text-gray-600">{message}</p>}
        </div>
        </div>
    );
}

export default Signup;