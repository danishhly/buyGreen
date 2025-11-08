import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../Component/Logo';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full text-center">
                {/* 404 Number */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-green-600 opacity-20 select-none">404</h1>
                </div>

                {/* Logo */}
                <div className="mb-8 flex justify-center">
                    <Logo className="text-5xl" />
                </div>

                {/* Main Message */}
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Page Not Found
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
                    Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-300 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Go Back
                    </button>
                    <Link
                        to="/CustomerHome"
                        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Go to Home
                    </Link>
                </div>

                {/* Helpful Links */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-4">You might be looking for:</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/CustomerHome" className="text-green-600 hover:text-green-700 font-medium text-sm">
                            Browse Products
                        </Link>
                        <Link to="/cart" className="text-green-600 hover:text-green-700 font-medium text-sm">
                            Shopping Cart
                        </Link>
                        <Link to="/orders" className="text-green-600 hover:text-green-700 font-medium text-sm">
                            My Orders
                        </Link>
                        <Link to="/profile" className="text-green-600 hover:text-green-700 font-medium text-sm">
                            My Profile
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;

