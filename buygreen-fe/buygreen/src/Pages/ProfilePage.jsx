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
        return <p>Loading...</p>; // Or a loading spinner
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8 text-green-700">Profile</h1>
            
            {/* 5. NEW Polished Layout (2-column grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Column 1: Details & Orders */}
                <div className="space-y-8">
                    {/* Account Details Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Account Details</h2>
                        <div className="space-y-3">
                            <p>
                                <strong>Name:</strong> {customer.name}
                            </p>
                            <p>
                                <strong>Email:</strong> {customer.email}
                            </p>
                            <p>
                                <strong>Role:</strong> <span className="capitalize">{customer.role}</span>
                            </p>
                        </div>
                    </div>

                    {/* My Orders Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">My Orders</h2>
                        <p className="text-gray-600 mb-4">View your complete order history.</p>
                        <Link
                            to="/orders"
                            className="inline-block bg-green-600 text-white py-2 px-5 rounded-md hover:bg-green-700 transition-colors"
                        >
                            View Orders
                        </Link>
                    </div>
                </div>

                {/* Column 2: Change Password */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Old Password</label>
                            <input
                                type="password"
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 p-2 rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 p-2 rounded-md shadow-sm"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                        >
                            Update Password
                        </button>
                        
                        {message && (
                            <p className={`mt-4 text-center ${isError ? 'text-red-600' : 'text-green-600'}`}>
                                {message}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;