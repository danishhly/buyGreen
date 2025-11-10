import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig'; // Use the configured API instance

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        try {
            const response = await api.post('/forgot-password', { email });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex items-center justify-center min-h-screen bg-green-50">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
                    Forgot Password
                </h2>
                <p className="text-center text-gray-600 mb-6">
                    Enter your email and we'll send you a link to reset your password.
                </p>
                
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border border-gray-300 p-2 rounded-md"
                    />
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md disabled:bg-green-300"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                
                {message && (
                    <p className="mt-4 text-center text-green-600">{message}</p>
                )}

                <div className="text-sm text-center mt-6">
                    <Link to="/login" className="font-medium text-green-600 hover:underline">
                        &larr; Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;