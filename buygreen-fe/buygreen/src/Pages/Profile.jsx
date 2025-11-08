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
    
    // Account Information state
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [accountData, setAccountData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [emailChangeData, setEmailChangeData] = useState({
        newEmail: '',
        password: ''
    });
    const [accountMessage, setAccountMessage] = useState('');
    const [accountIsError, setAccountIsError] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingEmailLoading, setIsChangingEmailLoading] = useState(false);

    // 1. Load customer data from localStorage on component mount
    useEffect(() => {
        const storedCustomer = localStorage.getItem('customer');
        if (storedCustomer) {
            const customerData = JSON.parse(storedCustomer);
            setCustomer(customerData);
            // Initialize account data with customer info and defaults
            setAccountData({
                name: customerData.name || '',
                email: customerData.email || '',
                phone: customerData.phone || '',
                address: customerData.address || ''
            });
        }
    }, []);

    // 2. Handler for the password form fields
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handler for account information fields
    const handleAccountChange = (e) => {
        const { name, value } = e.target;
        setAccountData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear message when user starts typing
        if (accountMessage) {
            setAccountMessage('');
        }
    };

    // Handler to save account information
    const handleSaveAccountInfo = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setAccountMessage('');
        setAccountIsError(false);

        try {
            // Validate required fields
            if (!accountData.name.trim() || !accountData.email.trim()) {
                setAccountMessage('Name and Email are required fields.');
                setAccountIsError(true);
                setIsSaving(false);
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(accountData.email)) {
                setAccountMessage('Please enter a valid email address.');
                setAccountIsError(true);
                setIsSaving(false);
                return;
            }

            // Call the backend API endpoint
            const response = await api.put('/customers/update-profile', {
                name: accountData.name,
                phone: accountData.phone,
                address: accountData.address
                // Note: Email is not updated through this endpoint for security
            });
            
            // Update customer in localStorage with response data
            const updatedCustomerData = response.data.customer;
            const updatedCustomer = {
                ...customer,
                name: updatedCustomerData.name,
                phone: updatedCustomerData.phone || '',
                address: updatedCustomerData.address || ''
            };
            localStorage.setItem('customer', JSON.stringify(updatedCustomer));
            setCustomer(updatedCustomer);

            // Show success message
            setAccountMessage('Account information updated successfully!');
            setAccountIsError(false);
            setIsEditing(false);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setAccountMessage('');
            }, 3000);

        } catch (error) {
            console.error('Error updating account information:', error);
            setAccountMessage(error.response?.data?.message || 'Failed to update account information. Please try again.');
            setAccountIsError(true);
        } finally {
            setIsSaving(false);
        }
    };

    // Handler to cancel editing
    const handleCancelEdit = () => {
        // Reset to original customer data
        setAccountData({
            name: customer.name || '',
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || ''
        });
        setIsEditing(false);
        setIsChangingEmail(false);
        setEmailChangeData({ newEmail: '', password: '' });
        setAccountMessage('');
        setAccountIsError(false);
    };

    // Handler for email change
    const handleEmailChange = (e) => {
        const { name, value } = e.target;
        setEmailChangeData(prev => ({
            ...prev,
            [name]: value
        }));
        if (accountMessage) {
            setAccountMessage('');
        }
    };

    // Handler to save email change
    const handleSaveEmailChange = async (e) => {
        e.preventDefault();
        setIsChangingEmailLoading(true);
        setAccountMessage('');
        setAccountIsError(false);

        try {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailChangeData.newEmail)) {
                setAccountMessage('Please enter a valid email address.');
                setAccountIsError(true);
                setIsChangingEmailLoading(false);
                return;
            }

            // Check if new email is same as current
            if (emailChangeData.newEmail.toLowerCase() === accountData.email.toLowerCase()) {
                setAccountMessage('New email must be different from current email.');
                setAccountIsError(true);
                setIsChangingEmailLoading(false);
                return;
            }

            if (!emailChangeData.password) {
                setAccountMessage('Password is required to change email.');
                setAccountIsError(true);
                setIsChangingEmailLoading(false);
                return;
            }

            // Call the backend API endpoint
            const response = await api.post('/customers/change-email', {
                newEmail: emailChangeData.newEmail,
                password: emailChangeData.password
            });

            // Update customer in localStorage with new email and token
            const updatedCustomerData = response.data.customer;
            const updatedCustomer = {
                ...customer,
                email: updatedCustomerData.email
            };
            localStorage.setItem('customer', JSON.stringify(updatedCustomer));
            localStorage.setItem('token', response.data.token);
            setCustomer(updatedCustomer);

            // Update account data
            setAccountData(prev => ({
                ...prev,
                email: updatedCustomerData.email
            }));

            // Show success message
            setAccountMessage('Email changed successfully! Your session has been updated.');
            setAccountIsError(false);
            setIsChangingEmail(false);
            setEmailChangeData({ newEmail: '', password: '' });

            // Clear success message after 5 seconds
            setTimeout(() => {
                setAccountMessage('');
            }, 5000);

        } catch (error) {
            console.error('Error changing email:', error);
            setAccountMessage(error.response?.data?.message || 'Failed to change email. Please check your password and try again.');
            setAccountIsError(true);
        } finally {
            setIsChangingEmailLoading(false);
        }
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
                        {/* Account Information Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
                            
                            {/* Success/Error Message */}
                            {accountMessage && (
                                <div className={`mb-6 p-4 rounded-lg ${
                                    accountIsError 
                                        ? 'bg-red-50 border border-red-200' 
                                        : 'bg-green-50 border border-green-200'
                                }`}>
                                    <p className={`text-sm font-semibold ${
                                        accountIsError ? 'text-red-800' : 'text-green-800'
                                    }`}>
                                        {accountMessage}
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSaveAccountInfo} className="space-y-5">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={accountData.name}
                                            onChange={handleAccountChange}
                                            readOnly={!isEditing}
                                            onFocus={(e) => {
                                                if (!isEditing) {
                                                    e.target.blur();
                                                }
                                            }}
                                            required
                                            className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                                isEditing 
                                                    ? 'bg-white text-gray-900 cursor-text' 
                                                    : 'bg-gray-50 text-gray-700 cursor-not-allowed'
                                            }`}
                                            placeholder="Your full name"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    {!isChangingEmail ? (
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={accountData.email}
                                                readOnly
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                                                placeholder="your.email@example.com"
                                            />
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsChangingEmail(true)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm font-semibold text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                                >
                                                    Change Email
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="email"
                                                    name="newEmail"
                                                    value={emailChangeData.newEmail}
                                                    onChange={handleEmailChange}
                                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                                    placeholder="Enter new email address"
                                                    required
                                                />
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={emailChangeData.password}
                                                    onChange={handleEmailChange}
                                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                                    placeholder="Enter your password to confirm"
                                                    required
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={handleSaveEmailChange}
                                                    disabled={isChangingEmailLoading}
                                                    className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {isChangingEmailLoading ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Changing...
                                                        </>
                                                    ) : (
                                                        'Save Email'
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsChangingEmail(false);
                                                        setEmailChangeData({ newEmail: '', password: '' });
                                                    }}
                                                    disabled={isChangingEmailLoading}
                                                    className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={accountData.phone}
                                            onChange={handleAccountChange}
                                            readOnly={!isEditing}
                                            onFocus={(e) => {
                                                if (!isEditing) {
                                                    e.target.blur();
                                                }
                                            }}
                                            className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                                isEditing 
                                                    ? 'bg-white text-gray-900 cursor-text' 
                                                    : 'bg-gray-50 text-gray-700 cursor-not-allowed'
                                            }`}
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            name="address"
                                            value={accountData.address}
                                            onChange={handleAccountChange}
                                            readOnly={!isEditing}
                                            onFocus={(e) => {
                                                if (!isEditing) {
                                                    e.target.blur();
                                                }
                                            }}
                                            className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                                isEditing 
                                                    ? 'bg-white text-gray-900 cursor-text' 
                                                    : 'bg-gray-50 text-gray-700 cursor-not-allowed'
                                            }`}
                                            placeholder="123 Green Street, Eco City, EC 12345"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {!isEditing ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                                    >
                                        Edit Information
                                    </button>
                                ) : (
                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            disabled={isSaving}
                                            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </form>
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