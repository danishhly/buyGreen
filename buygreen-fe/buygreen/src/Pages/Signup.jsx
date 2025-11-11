import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../Component/Logo';
import { useToast } from '../Component/Toast';
import { validateName, validateEmail, validatePassword } from '../utils/validation';


function Signup() {
    const { success, error } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        // Validate form fields
        const nameValidation = validateName(formData.name);
        if (!nameValidation.isValid) {
            setMessage(nameValidation.message);
            setIsLoading(false);
            return;
        }

        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.isValid) {
            setMessage(emailValidation.message);
            setIsLoading(false);
            return;
        }

        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            setMessage(passwordValidation.message);
            setIsLoading(false);
            return;
        }
        
        try {
            // Always set role to "customer" - admin accounts can only be created by backend
            const signupData = {
                ...formData,
                role: "customer"
            };
            const response = await api.post("/signup", signupData);
            success(response.data.message || "Signup successful!");
            setMessage(response.data.message || "Signup successful!");

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error("Signup error:", err);
            console.error("Signup error response:", err.response);
            
            // Handle different error types
            if (!err.response) {
                // Network error
                const errorMessage = "Cannot connect to server. Please check your internet connection.";
                error(errorMessage);
                setMessage(errorMessage);
            } else if (err.response.status === 400) {
                // Bad request - usually means email already exists
                const errorMessage = err.response?.data?.message || "Email already exists. Please use a different email or try logging in.";
                error(errorMessage);
                setMessage(errorMessage);
            } else if (err.response.status === 403) {
                // Permission denied - should not happen for signup, but handle it
                const errorMessage = "Signup is currently unavailable. Please try again later or contact support.";
                error(errorMessage);
                setMessage(errorMessage);
            } else {
                // Other errors
                const errorMessage = err.response?.data?.message || "Error during signup. Please try again.";
                error(errorMessage);
                setMessage(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsGoogleLoading(true);
        setMessage("");
        try {
            if (!credentialResponse?.credential) {
                throw new Error("No credential received from Google");
            }
            
            console.log("Sending Google token to backend...");
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
            console.log("API Base URL:", apiBaseUrl);
            
            const response = await api.post("/auth/google", { token: credentialResponse.credential });
            console.log("Google sign-up response:", response.data);

            if (!response.data || !response.data.customer) {
                throw new Error("Invalid response from server");
            }

            const customer = response.data.customer;
            const token = response.data.token;

            localStorage.setItem('customer', JSON.stringify(customer));
            localStorage.setItem('customerId', String(customer.id));
            localStorage.setItem('customerName', customer.name);
            localStorage.setItem('Role', customer.role);
            if (token) {
                localStorage.setItem('token', token);
            }

            success("Google sign-up successful!");
            
            setTimeout(() => {
                if (customer.role === "admin") {
                    navigate("/AdminDashboard");
                } else {
                    navigate("/CustomerHome");
                }
            }, 500);

        } catch (err) {
            console.error("Google sign-up error details:", {
                message: err.message,
                response: err.response,
                code: err.code,
                config: err.config
            });
            
            // Check if it's a network error (ERR_BLOCKED_BY_CLIENT usually means ad blocker)
            if (err.message?.includes('ERR_BLOCKED_BY_CLIENT') || err.code === 'ERR_BLOCKED_BY_CLIENT') {
                error("Google sign-up is blocked. Please disable ad blockers or browser extensions and try again.");
                setMessage("Google sign-up is blocked. Please disable ad blockers and try again.");
            } else if (!err.response) {
                // Network error - likely CORS or backend not reachable
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
                error(`Cannot connect to backend server. Please check if ${apiBaseUrl} is accessible.`);
                setMessage(`Cannot connect to backend server. Please check if ${apiBaseUrl} is accessible.`);
            } else {
                const errorMessage = err.response?.data?.message || err.message || "Google sign-up failed. Please try again.";
                error(errorMessage);
                setMessage(errorMessage);
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleGoogleError = (error) => {
        // Only show error if it's not a user cancellation
        console.error("Google sign-up error:", error);
        // Don't show error toast for user cancellation or popup blockers
        if (error?.type !== 'popup_closed_by_user') {
            // Only show error for actual errors, not user cancellation
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Side - Quote Panel - Hidden on Mobile */}
            <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-r-3xl">
                {/* Abstract Wave Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full">
                        <svg className="w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="none">
                            <path d="M0,200 Q100,100 200,200 T400,200 L400,800 L0,800 Z" fill="url(#gradient1)" />
                            <path d="M0,400 Q150,300 300,400 T400,400 L400,800 L0,800 Z" fill="url(#gradient2)" />
                            <defs>
                                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
                                </linearGradient>
                                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.1" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
                
                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    <div className="text-xs uppercase tracking-wider text-green-100 mb-8">A WISE QUOTE</div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                            Start Your<br />Green Journey
                        </h1>
                        <p className="text-lg text-green-50 leading-relaxed max-w-md">
                            Join thousands of eco-conscious shoppers making sustainable choices. Together, we can create a greener future for generations to come.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form - Full Width on Mobile */}
            <div className="w-full lg:w-3/5 flex items-center justify-center bg-white p-6 sm:p-8 lg:p-12 min-h-screen lg:min-h-0">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="mb-8 lg:mb-12 text-center lg:text-left">
                        <Link to="/" className="flex items-center justify-center lg:justify-start mb-6 lg:mb-8">
                            <Logo className="text-3xl lg:text-4xl" />
                        </Link>
                        
                        <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-2 lg:mb-3">Create Account</h2>
                        <p className="text-sm lg:text-base text-gray-500">Enter your details to start your eco-friendly shopping journey</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input 
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Message */}
                    {message && (
                        <div className={`mt-4 text-center text-sm ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                            {message}
                        </div>
                    )}

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign Up */}
                    <div className="w-full flex justify-center">
                        <div className="relative w-full max-w-full">
                            <div className="w-full flex justify-center [&>div]:w-full [&>div]:flex [&>div]:justify-center [&>div>iframe]:w-full">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    useOneTap={false}
                                    theme="outline"
                                    size="large"
                                    text="signup_with"
                                    shape="rectangular"
                                    logo_alignment="left"
                                />
                            </div>
                            {isGoogleLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg z-10">
                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-600"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Login Link */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-gray-900 hover:text-green-600 transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
