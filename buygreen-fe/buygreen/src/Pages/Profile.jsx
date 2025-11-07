import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig'; // Use our secure axios instance

const ProfilePage = () => {
    const [customer, setCustomer] = useState(null);
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
    });
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // 1. Load customer data from localStorage on component mount
    useEffect(() => {
        const storedCustomer = localStorage.getItem('customer');
        if (storedCustomer) {
            setCustomer(JSON.parse(storedCustomer));
        }
    }, []);

    // 2. Handler for the password form fields
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // 3. Handler to submit the new password
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        if (formData.newPassword.length < 6) {
            setMessage('New password must be at least 6 characters long.');
            setIsError(true);
            return;
        }

        try {
            // 4. Call the new secure endpoint
            const response = await api.post('/customers/change-password', formData);
            setMessage(response.data.message);
            setIsError(false);
            // Clear form on success
            setFormData({ oldPassword: '', newPassword: '' });
        } catch (error) {
            setMessage(error.response?.data?.message || 'An error occurred.');
            setIsError(true);
        }
    };

    if (!customer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Profile
                    </h1>
                </div>
                
                {/* Layout (2-column grid) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Column 1: Details & Orders */}
                    <div className="space-y-6">
                        {/* Account Details Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                Account Details
                            </h2>
                            <div className="space-y-4">
                                <div className="pb-4 border-b border-gray-100">
                                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Name</p>
                                    <p className="text-lg font-semibold text-gray-900">{customer.name}</p>
                                </div>
                                <div className="pb-4 border-b border-gray-100">
                                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Email</p>
                                    <p className="text-lg font-semibold text-gray-900">{customer.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Role</p>
                                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold capitalize">
                                        {customer.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* My Orders Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                </svg>
                                My Orders
                            </h2>
                            <p className="text-gray-600 mb-6">View your complete order history and track your purchases.</p>
                            <Link
                                to="/orders"
                                className="inline-flex items-center gap-2 bg-green-700 text-white py-3 px-6 rounded-md hover:bg-green-800 transition-colors font-semibold"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18l6-6-6-6"></path>
                                </svg>
                                View Orders
                            </Link>
                        </div>
                    </div>

                    {/* Column 2: Change Password */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            Change Password
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Old Password</label>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    value={formData.oldPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                    placeholder="Enter your current password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                    placeholder="Enter your new password (min. 6 characters)"
                                />
                                <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long.</p>
                            </div>
                            
                            <button
                                type="submit"
                                className="w-full bg-green-700 text-white py-3 px-6 rounded-lg hover:bg-green-800 transition-colors font-semibold text-lg"
                            >
                                Update Password
                            </button>
                            
                            {message && (
                                <div className={`mt-4 p-4 rounded-lg ${isError ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                                    <p className={`text-center font-semibold ${isError ? 'text-red-700' : 'text-green-700'}`}>
                                        {message}
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;