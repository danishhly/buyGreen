// src/components/Navbar.jsx

import React, { useEffect, useState } from 'react';
// 1. Import useLocation
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { useCart } from '../Hooks/UseCart';

const Navbar = () => {
    const { cartCount } = useCart();
    const [customer, setCustomer] = useState(null);
    const navigate = useNavigate();
    
    // 2. Get the current location
    const location = useLocation();

    // 3. This useEffect will now re-run every time the URL changes (e.g., from /login to /)
    useEffect(() => {
        const storedCustomer = localStorage.getItem('customer');
        if (storedCustomer) {
            try {
                setCustomer(JSON.parse(storedCustomer));
            } catch (err) {
                console.error('Failed to parse stored customer', err);
                setCustomer(null);
            }
        } else {
            setCustomer(null);
        }
    }, [location]); // 4. Add 'location' as a dependency

    const handleLogout = () => {
        localStorage.removeItem('customer');
        localStorage.removeItem('customerId');
        localStorage.removeItem('customerName');
        localStorage.removeItem('Role');
        setCustomer(null);
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* LEFT SECTION: Logo and Main Nav Links */}
                    <div className="flex items-center">
                        <div className="shrink-0">
                            <Link to="/" className="text-2xl font-bold text-green-700">
                                BuyGreen
                            </Link>
                        </div>
                        <div className="hidden md:block ml-6">
                            <ul className="flex items-center gap-6 text-sm">
                                <li><Link to="/CustomerHome" className="text-gray-500 transition hover:text-green-700/75">Home</Link></li>
                                
                                {customer && (
                                    <li>
                                        <Link to="/profile" className="text-gray-500 transition hover:text-green-700/75">
                                            Hi, {customer.name}
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* RIGHT SECTION: Profile, Cart Icon and Auth Buttons */}
                    <div className="flex items-center gap-4">
                        {customer && (
                            <Link
                                to="/profile"
                                className="hidden sm:inline-flex items-center rounded-md border border-green-700 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 transition-colors"
                                title="Profile"
                            >
                                Hi, {customer.name}
                            </Link>
                        )}
                        <Link to="/cart" className="relative text-gray-600 hover:text-green-700 p-2 rounded-md">
                            {/* ... cart svg ... */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-green-700 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* This will also work correctly */}
                        {customer ? (
                            <button
                                onClick={handleLogout}
                                className="rounded-md bg-green-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-800 transition-colors"
                            >
                                Logout
                            </button>
                        ) : (
                             <Link to="/login" className="rounded-md bg-green-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-800 transition-colors">
                                Login
                            </Link>
                        )}
                        
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;