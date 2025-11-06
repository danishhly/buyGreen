import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token'); // Gets token from URL

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setIsError(false);

        if (!token) {
            setMessage('Invalid or missing reset token.');
            setIsError(true);
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/reset-password', {
                token: token,
                newPassword: newPassword
            });
            setMessage(response.data.message);
            setIsError(false);
            setTimeout(() => navigate('/login'), 2000); // Redirect to login on success
        } catch (error) {
            setMessage(error.response?.data?.message || 'An error occurred.');
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex items-center justify-center min-h-screen bg-green-50">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
                    Reset Your Password
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <input
                        type="password"
                        name="newPassword"
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="border border-gray-300 p-2 rounded-md"
                    />
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md disabled:bg-green-300"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
                
                {message && (
                    <p className={`mt-4 text-center ${isError ? 'text-red-600' : 'text-green-600'}`}>
                        {message}
                    </p>
                )}

                {!token && (
                     <div className="text-sm text-center mt-6">
                        <Link to="/forgot-password" className="font-medium text-green-600 hover:underline">
                            Request a new link
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;