import React, { useState, useEffect } from 'react';
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

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
            // 2. Call the new secure endpoint
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
        <div className="max-w-xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6 text-green-700">Your Profile</h1>
            
            {/* User Details Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Account Details</h2>
                <div className="space-y-2">
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

            {/* Change Password Section */}
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
                            className="mt-1 block w-full border border-gray-300 p-2 rounded-md"
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
                            className="mt-1 block w-full border border-gray-300 p-2 rounded-md"
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
    );
};

export default ProfilePage;