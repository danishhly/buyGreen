import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate} from 'react-router-dom';

function Signup() {
    const[formData,setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role:"customer", // Default role is customer
    });

    const[message, setMessage] = useState("");
    const navigate = useNavigate();

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

    // function to handle google login
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await axios.post(
                "http://localhost:8080/auth/google",
                { token: credentialResponse.credential}
            );

            //backend returns data in localStorage
            const customer = response.data;

            //Store customer data in localStorage
            localStorage.setItem('customer', JSON.stringify(customer));

            // Redirect based on role
            if (customer.role == "admin") {
                navigate("/AdminDashboard");
            } else {
                navigate("/customerHome");
            }
        } catch (error) {
            setMessage(error.response?.data?.message || "Google login failed.")
            console.error(error);
        }
    };

    const handleGoogleError = () => {
        setMessage("Google login failed. please try again");
    };

    return(
        <div className ="w-full flex items-center justify-center min-h-screen bg-screen-50">
        <div className ="w-full max-w-md rounded-lg bg-white p-8 shadow">
            <h1 className ="text-2xl fon-bold text-green-700 mb-6 text-center">
                BuyGreen Signup
            </h1>

            {/* Add the Google Login Button */}
            <div className="flex flex-col items-center mb-4">
                <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                />
            </div>

            <div className="relative flex py-5 items-center">
                <div className="grow border-t border-gray-300"></div>
                <div className="shrink mx-4 text-gray-400">OR</div>
                <div className="grow border-t border-gray-300"></div>



</div>


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